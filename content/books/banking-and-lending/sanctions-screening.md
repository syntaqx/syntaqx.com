+++
title = "Sanctions Screening"
description = "OFAC compliance for a bank: the lists, the 50 percent rule, fuzzy matching and tuning, customer and payment screening, blocking, reporting and records."
category = "Banking & Lending Industry"
order = 2422
part = "Financial Crime"
tags = ["banking", "sanctions", "ofac", "screening", "fuzzy-matching", "compliance"]
+++

Anti-money laundering asks a bank to notice and report. Sanctions ask it to stop. When a customer, a counterparty or anyone with an interest in a payment is a person the Treasury's Office of Foreign Assets Control has blocked, the bank must freeze the property and report it within ten business days, and when a payment is prohibited without a blockable interest, it must refuse it and report that too. There is no dollar threshold, no "reasonable belief" standard and no knowledge requirement: OFAC "may impose civil penalties for sanctions violations based on strict liability," so a payment processed to a blocked person because a screening list was a day stale is a violation whether or not anyone knew.

That makes screening an engineering problem with an unusual shape. It must run on every customer at opening and every time the lists change, and on payments before they execute, so it sits in the critical path of account opening and of every wire. It matches names, which are the worst identifiers in computing: transliterated, reordered, abbreviated, misspelled, shared by thousands of innocent people. It produces far more false hits than true ones, and every hit is a person waiting or a payment held. And its results must be kept for ten years, along with the version of the list each decision was made against.

This chapter is the bank's side: the obligations, the lists, the 50 percent rule, matching and tuning, when to screen customers and payments, clearing a hit, blocking, rejecting and reporting, and records. The rule in one sentence for providers is in [The Financial Crime Layer](/books/payments/payments-rulebook#the-financial-crime-layer) and [Gatekeeping: Sanctions, AML and Losses](/books/payments/becoming-a-payment-provider#gatekeeping-sanctions-aml-and-losses); cross-border routes and the travel rule are in [Sanctions and Data on Cross-Border Flows](/books/payments/cross-border-and-fx#sanctions-and-data-on-cross-border-flows); a marketplace's version is [Sanctions Screening and Background Checks](/books/user-generated-platforms/marketplace-fraud#sanctions-screening-and-background-checks).

## How the Platforms Do It

What OFAC and screening vendors document publicly, as of October 2026:

| Tool | What it is | Matching | Review states and monitoring |
| --- | --- | --- | --- |
| **OFAC Sanctions List Search** | OFAC's own search over the SDN and Consolidated lists, for individual users, "not... automated systems" | Name field only is fuzzy: candidates narrowed by first letter and at least 50% edit-distance similarity, then scored by Jaro-Winkler and Soundex on the full name and its parts, higher score shown; a further algorithm added in 2021; ID field exact only | A Minimum Name Score slider that defaults to 100 (exact); OFAC "does not provide recommendations" on a threshold |
| **ComplyAdvantage** | Screening API over sanctions, warnings, PEPs and adverse media | `fuzziness` from 0.0 to 1.0, overridden by `exact_match`; internal blacklists | Match statuses `no_match`, `potential_match`, `false_positive`, `true_positive`, `true_positive_approve`, `true_positive_reject`, `unknown`; monitored searches with differences to acknowledge; a `client_ref` suppresses repeat false positives unless results change |
| **Middesk** | KYB with a watchlist task | Not documented publicly | A `watchlist` task with `success`, `warning`, `failure` or `neutral` |
| **Persona** | Watchlist, PEP and adverse media reports beside identity inquiries | Not documented publicly | Reports that can recur monthly or yearly against an account |
| **Plaid Monitor** | Sanctions and PEP screening for individuals and entities, with lists updated daily | Program-level sensitivity; raising it later "may produce many new hits" | Hits `pending_review`, `cleared` (dismissed) or `rejected` (confirmed); daily rescreening of the whole customer base into the review queue |
| **Socure** | Global Watchlist Screening on its RiskOS platform | Not documented publicly | Not documented publicly |

Three things stand out. **Sensitivity is the customer's setting, not the vendor's.** OFAC won't recommend a score, ComplyAdvantage exposes a fuzziness number, Plaid puts sensitivity on a program: the bank's risk assessment has to choose, document and test it. **Rescreening is a product, not a batch job someone remembers:** Plaid rescreens daily, ComplyAdvantage monitors searches and surfaces differences, Persona recurs reports. **Suppressing known false positives is built in,** by client reference or by status, which is necessary for volume and dangerous without an expiry, because a list change can turn yesterday's false positive into today's true match.

## What Sanctions Require

OFAC's regulations bind all **US persons**, including US banks, bank holding companies and their nonbank subsidiaries, and unlike the BSA they reach a bank's foreign branches and often its overseas offices and subsidiaries. The FFIEC's BSA/AML manual summarizes what they require of a bank in two verbs:

- **Block** the accounts and other property of specified countries, entities and individuals: property that is in the United States, held by US persons, or comes into their possession or control. A bank must block a transaction that is by or on behalf of a blocked person, to or through a blocked entity, or in connection with a transaction in which a blocked person has an interest. A funds transfer that falls in those categories is executed into a **blocked account**, not returned, and can't be cancelled or amended without OFAC's authorization.
- **Reject** a prohibited transaction in which there is no blockable interest: the payment is simply not processed. The manual's example is a transfer between two non-designated companies for an export a program prohibits.

Licenses are the exception mechanism. **General licenses** in each program's regulations authorize categories of transactions; **specific licenses** are issued to an applicant for particular transactions and time periods. A bank processing under a license verifies the transaction fits its terms and dates, and the manual suggests keeping a copy for five years after the last transaction under it.

**A program is expected, not prescribed.** No regulation requires a written sanctions compliance program, but the FFIEC manual calls one sound banking practice, and OFAC's 2019 Framework for OFAC Compliance Commitments names five "essential components": management commitment, risk assessment, internal controls, testing and auditing, and training. Its appendix of root causes of past violations includes "Sanctions Screening Software or Filter Faults": failing to update screening software for list changes, failing to include identifiers such as SWIFT BICs of sanctioned banks, and not accounting for alternative spellings ("Habana instead of Havana, Kuba instead of Cuba, Soudan instead of Sudan"). The existence and adequacy of a program is a factor in OFAC's Enforcement Guidelines (Appendix A to 31 CFR part 501), which set base penalties by whether the case is egregious and whether it was voluntarily self-disclosed: for a non-egregious case, one-half of the transaction value (capped) with self-disclosure, or the "applicable schedule amount" without; for an egregious one, one-half of the statutory maximum or the statutory maximum. Under IEEPA, the guidelines list the maximum per violation as the greater of $377,700 or twice the transaction amount. In September 2026 OFAC consolidated penalty information for several programs in a new 31 CFR part 505 (91 FR 60821, effective September 25, 2026), described as making no substantive changes to penalties, and removed duplicative penalty provisions from the program parts (91 FR 61727, September 30, 2026).

Enforcement is steady rather than rare: OFAC's page lists 14 actions totaling $265,746,819 in 2025, and 10 actions totaling $297,513,285 in 2026 as of October, including Bank of America, N.A. ($11,662,930, October 13, 2026).

## Lists and List Management

The lists a US bank screens:

- **The Specially Designated Nationals and Blocked Persons List (SDN List):** individuals, entities, vessels and aircraft whose property is blocked, with aliases, dates of birth, nationalities, addresses, identification numbers and program codes.
- **The Consolidated Sanctions List:** OFAC's non-SDN lists in one file, each with its own, narrower prohibitions. A hit there is not automatically a block; the program code says what applies.
- **Comprehensively sanctioned jurisdictions,** which no name list captures: a payment to a person in such a place may be prohibited even when no party is listed, which is why geography and identifiers such as BICs are screened as well as names.
- **Other regimes where the bank operates:** the EU, UK and UN lists for foreign branches and affiliates.

OFAC publishes the lists as machine-readable files (XML, CSV and fixed-field and delimited formats) for automated systems, and says Sanctions List Search itself "should not be utilized by automated systems." **Weak AKAs** are aliases OFAC considers "relatively broad or generic" and likely to produce false hits (short names, digits, nicknames, geographic terms, common prefixes); they are quoted in the text file, marked in remarks in the delimited files, typed "weak" in legacy XML and flagged `LowQuality` in the advanced XML. OFAC "does not expect that persons will screen for weak AKAs" and generally won't penalize processing a transaction where a weak AKA was the only reference, the processor had no other reason to know, and its program is rigorous; they are for confirming a hit found by other means.

List management is where the most embarrassing failures live:

- **Every list version is stored,** with its source, publication identifier, fetch time and a hash, and every screening records the version it ran against. "Was this person on the list when we approved the wire?" must be a query, not a reconstruction.
- **Completeness is checked on load.** Entry counts, program counts and a sample of known entries compared with the source, every load. Starling's automated screening checked customers against "only a fraction" of the list from 2017 until it noticed in January 2023 ([Starling, 2024](/books/banking-and-lending/bsa-aml#starling-2024)).
- **Updates propagate everywhere the bank screens,** including foreign offices and every vendor, within a target time the program states, and the FFIEC manual says manual updates to interdiction software must be "completed in a timely manner."
- **A new list version triggers rescreening** of the customer base against the delta, at minimum, and of every pending payment in review.

## The 50 Percent Rule

An entity is blocked if it is owned 50% or more, directly or indirectly, in the aggregate, by one or more blocked persons, whether or not it appears on any list. OFAC's FAQs set out how to count:

- **Aggregate across blocked owners,** including owners blocked under different programs: two blocked persons with 25% each make the entity blocked (FAQ 399).
- **Count indirect ownership only through blocked entities.** Ownership flows through an intermediate entity only if that entity is itself 50% or more owned by blocked persons, and so blocked (FAQ 401).
- **Ownership, not control.** An entity a blocked person controls but owns less than 50% of is not blocked by the rule, though OFAC may designate it and caution is warranted; and a blocked individual can't act for a non-blocked entity in a transaction with a US person (FAQs 398, 400).
- **Divestiture below 50% unblocks going forward only** if it happened entirely outside US jurisdiction without US persons; property blocked while ownership was at or above 50% stays blocked, and OFAC "does not recognize any subsequent unlicensed transfers" (FAQ 402).
- **Due diligence is expected** on parties and their ownership before transacting.

### Worked numbers: who is blocked

Two individuals, A and B, are on the SDN List. Their holdings:

| Entity | Owners | Blocked? |
| --- | --- | --- |
| **X** | A 30%, B 25%, others 45% | Yes: 30% + 25% = 55% held by blocked persons |
| **Y** | X 60%, others 40% | Yes: X is blocked, and owns 60% |
| **Z** | X 30%, A 15%, others 55% | No: 30% + 15% = 45%, below 50% |
| **W** | Q 50%, others 50%, where Q is 40% owned by A | No: Q is not blocked (40%), so its stake doesn't count toward W |
| **V** | Y 25%, B 25%, others 50% | Yes: Y is blocked, so 25% + 25% = 50%, which meets "50 percent or more" |

None of X, Y or V needs to appear on a list for a payment to it to be blocked. A bank learns these structures from its customer's beneficial ownership records, its business customers' corporate documents and vendor ownership data, which is why the ownership chain collected in [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#kyb-business-accounts) is a sanctions input too. The computation is a graph walk over ownership edges, shown in How to Build It.

## Matching and Tuning

Screening compares names in the bank's records and in payments with names on the lists and decides which pairs a person should review. Exact matching misses transliterations and typos; loose matching buries reviewers. The FFIEC manual's guidance is that the criteria for name variations "should be based on the level of OFAC risk associated with the particular product or type of transaction": high-risk, high-volume areas need software that catches "close name derivations," and a bank that finds a derivation of a target's name should add it to its filter.

The algorithms OFAC's own tool uses illustrate the two families most screening combines:

- **String similarity** (Jaro-Winkler): the share of matching characters within a window, penalized for transpositions, with a bonus for a shared prefix.
- **Phonetic codes** (Soundex): names that sound alike in English map to the same four-character code.

### Worked numbers: two names, two algorithms

| List name | Record name | Jaro-Winkler | Soundex | What it means |
| --- | --- | --- | --- | --- |
| HAVANA | HABANA | 0.911 (5 of 6 characters match, 2-letter shared prefix) | H150, H150 | The Framework's own example of an alternate spelling, caught by both |
| MOHAMMED | MUHAMMAD | 0.850 (6 of 8 match, 1-letter prefix) | M530, M530 | A common transliteration pair: phonetically identical, moderately similar as strings |
| MOHAMMED | MOHAMED | 0.975 | M530, M530 | One letter dropped |
| SMITH | SMYTHE | 0.858 | S530, S530 | Similar by both, and the name of millions of people |

The last two rows are the tuning problem in miniature. A threshold that catches MUHAMMAD for MOHAMMED at 0.85 also flags every Smith against every Smythe, and the most common names on the lists are common names in the customer base. What separates a true hit is the rest of the record: date of birth, nationality, address, identification numbers, and the entity type. So:

- **Score names loosely, then filter on secondary identifiers.** A name score above the threshold with a conflicting date of birth or nationality is auto-cleared with that reason recorded; one with matching identifiers goes to a person.
- **Normalize before matching:** case, diacritics, punctuation, honorifics, legal suffixes (LLC, Ltd, OOO), token order, and transliteration of non-Latin scripts to the forms the list uses.
- **Treat the threshold as a parameter under change control,** chosen in the risk assessment per product (higher sensitivity for wires and cross-border, lower for low-risk domestic accounts), and tested against a labeled set: known list names, their recorded variants and derivations the bank has seen, and a sample of its own customer names. Record the false-negative rate on the variants and the alert volume on the sample for each candidate setting.
- **Retest after every algorithm change,** the bank's or the vendor's: OFAC itself recommended repeating prior testing after its 2021 Sanctions List Search change.
- **Suppress known false positives with an expiry and a list version.** A "good guy" record that suppresses a customer's repeat hit is re-evaluated when the matching list entry changes.

## When to Screen

The FFIEC manual's expectations translate into five triggers:

- **New customers, before opening or shortly after** ("e.g., during nightly processing"), and if after, with "procedures in place to prevent transactions, other than initial deposits, from occurring until the OFAC check is completed." Which account parties beyond the holder are screened (beneficiaries, guarantors, beneficial owners, directors, signers, powers of attorney) depends on the bank's risk profile, and in practice a bank with KYB data screens owners and signers too.
- **Existing customers when the lists change,** at a frequency set by risk; a lower-risk bank might compare its base weekly, monthly or quarterly, while most automated programs rescreen on every list update.
- **Funds transfers, letters of credit and noncustomer transactions, before execution.**
- **ACH by role.** For domestic ACH, the originating bank verifies its originator isn't blocked and the receiving bank verifies its receiver, each relying on the other; an ODFI that unbatches a file to process on-us items is responsible for those. For **international ACH (IAT)**, the receiving bank is responsible for inbound entries whether or not the OFAC flag is set, and an ODFI cannot rely on a foreign receiving bank's screening for outbound entries. Inbound IAT debits that appear to involve blockable property may be rejected by the gateway operator under OFAC's 2009 guidance.
- **Changes to the customer:** a new name, address, owner, signer or beneficial owner is a new screening.

OFAC also treats "the continued operation of an account or the processing of transactions post-designation" as a factor in its enforcement response, so the time between a designation and the bank acting on it is a measured interval, not an accident.

## Customer Screening and Payment Screening

The two run on the same lists and different constraints:

| | Customer screening | Payment screening |
| --- | --- | --- |
| **Subject** | A party: name, date of birth, nationality, address, IDs, owners | A message: originator, beneficiary, banks (names and BICs), addresses, free-text purpose and remittance fields |
| **When** | Opening, changes, every list update | Before execution, on every payment in scope |
| **Latency** | Seconds at opening; hours for a rescreen batch | Inside the payment's cutoff; for instant payments, inside the rail's response window |
| **On a hit** | The party's accounts are restricted pending review | The payment is held in a review state before release |
| **Data quality** | The bank's own verified data | Whatever the sender typed, often truncated or unstructured |

Payment screening reads fields customer screening never sees: a beneficiary name typed by someone else, a vessel name in a remittance field, a city in a free-text address. ISO 20022's structured fields help, and a payment with a truncated name or unstructured address is one a screening system may have to hold for the same reason a correspondent would. For instant payments, which can't be pulled back, screening must finish before acceptance, so the engine is sized for peak volume and the review queue for the rail's hours.

## Clearing a Hit

OFAC's FAQ on assessing name matches sets the review steps, which a review screen should follow in order:

1. **Is it an OFAC hit?** If the alert is on another agency's or a vendor's list, that agency's rules apply instead.
2. **Is there a broader OFAC nexus?** A sanctioned country, government or other unlisted target escalates to compliance before acting, with any applicable license checked.
3. **Compare the details:** aliases, dates of birth, identification numbers, nationality and addresses against the bank's data. Few matching details suggest a false hit; several suggest a valid one. A shared address alone may not be meaningful.
4. **A likely match follows the bank's procedures,** including a check for a general or specific license.
5. **Block or reject:** block property of an SDN or other blocked person; reject a prohibited transaction with no blockable interest.
6. **Keep records and report** blocks and rejections to OFAC within 10 business days.

OFAC's hotline answers questions but "does not confirm or deny potential matches or false positives"; the determination is the bank's, which is why every cleared hit records the identifiers compared and the reason.

## Blocking, Rejecting and Reporting

**A block** moves the property into a separate, interest-bearing blocked account: the bank tracks the amount, the owner and the interest. **A reject** returns or refuses the payment without processing it. Either way the report is due **within 10 business days**:

- **Blocked property reports** (31 CFR 501.603): filer and contact, the transaction and parties, the sanctions target, a description and location of the property, the date blocked, its US-dollar value, any action taken, the legal authority, and copies of related documents.
- **Annual report of blocked property:** everything blocked as of June 30, due by September 30, with values as of June 30.
- **Rejected transaction reports** (501.604): the rejecting person and contact, the transaction, parties, property, reference and account numbers, the target and its interest, the date, the value (rejected trade documents as $0.00 with the shipment value in a narrative; foreign currency converted with the rate noted), the legal authority (not "SDN" alone), and copies of documents, through the OFAC Reporting System.

**Worked dates.** A wire is blocked on Tuesday, October 20, 2026. Ten business days run Wednesday the 21st through Tuesday, November 3, so the blocked property report is due November 3, 2026. The funds sit in the blocked account until OFAC licenses their release, and appear in the annual report filed by September 30, 2027 (as of June 30, 2027) and every year after that while they remain blocked.

**SARs and OFAC.** The FFIEC manual says banks no longer need to file a SAR based solely on a blocked narcotics- or terrorism-related transaction if they file the blocking report, but should file a SAR if they have information not on the blocking report, or if the transaction would be suspicious without the OFAC match ([Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports)).

## Records

Since a 2024 amendment (89 FR 74832, effective March 12, 2025), 31 CFR 501.601 requires records of transactions under OFAC's regulations to be kept and available "for at least 10 years after the date of such transaction," and records of blocked property for as long as it is blocked and at least 10 years after it is unblocked. That is twice the BSA's five years, and the FFIEC manual's OFAC section still describes the older five-year period, so a bank's retention schedule has to follow the regulation, not the manual. The same records carry the list version and matcher configuration behind each decision, because the question in an enforcement review is what the bank knew and what its screening would have caught at the time.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model) and the `party_relationships` table from [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#how-to-build-it). A sanctions review that ends in a block or reject is a `cases` row of a new kind, `sanctions_review`, with its 10-business-day report deadline in the `case_deadlines` table from [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it); a SAR filed alongside it is a separate `aml_investigation` case.

```sql
-- Sanctions reviews are cases with their own clock.
ALTER TABLE cases DROP CONSTRAINT cases_kind_check;
ALTER TABLE cases ADD CONSTRAINT cases_kind_check CHECK (kind IN ('reg_e_error', 'reg_cc_claim',
  'billing_error', 'fraud_claim', 'credit_report_dispute', 'legal_process', 'complaint',
  'aml_investigation', 'hardship', 'sanctions_review'));

-- Every list version as loaded, with its completeness check.
CREATE TABLE sanctions_list_versions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  source              TEXT NOT NULL,          -- 'ofac_sdn', 'ofac_consolidated', 'eu', 'uk', 'un'
  published_ref       TEXT NOT NULL,          -- the publisher's version or publish date
  fetched_at          TIMESTAMPTZ NOT NULL,
  content_hash        TEXT NOT NULL,
  entry_count         INT NOT NULL,
  completeness_check  JSONB NOT NULL,         -- counts vs source, sampled entries found
  loaded_at           TIMESTAMPTZ,            -- null until the check passes
  UNIQUE (source, published_ref)
);

CREATE TABLE sanctions_list_entries (
  list_version_id     UUID NOT NULL REFERENCES sanctions_list_versions (id),
  entry_uid           TEXT NOT NULL,          -- the publisher's stable ID
  entry_type          TEXT NOT NULL,          -- 'individual', 'entity', 'vessel', 'aircraft'
  programs            TEXT[] NOT NULL,
  names               JSONB NOT NULL,         -- primary and aliases, each with strength 'strong'|'weak'
  identifiers         JSONB NOT NULL,         -- DOB, nationality, IDs, addresses, BICs
  PRIMARY KEY (list_version_id, entry_uid)
);

-- One screening of a party or a payment, against one list version and matcher configuration.
CREATE TABLE screenings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  subject_kind        TEXT NOT NULL CHECK (subject_kind IN ('party', 'transaction', 'payment_order')),
  party_id            UUID REFERENCES parties (id),
  transaction_id      UUID REFERENCES transactions (id),
  payment_order_ref   TEXT,                   -- an outbound order not yet posted
  trigger             TEXT NOT NULL,          -- 'onboarding', 'party_change', 'list_update', 'payment'
  list_version_ids    UUID[] NOT NULL,
  matcher_config      TEXT NOT NULL,          -- algorithm, threshold and normalization version
  vendor_ref          TEXT,
  hit_count           INT NOT NULL,
  screened_at         TIMESTAMPTZ NOT NULL,
  retain_until        DATE NOT NULL,          -- screened_at + 10 years at least
  CHECK (num_nonnulls(party_id, transaction_id, payment_order_ref) = 1)
);

CREATE TABLE screening_hits (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  screening_id        UUID NOT NULL REFERENCES screenings (id),
  list_version_id     UUID NOT NULL,
  entry_uid           TEXT NOT NULL,
  matched_field       TEXT NOT NULL,          -- 'name', 'alias', 'bic', 'address', 'country'
  matched_value       TEXT NOT NULL,
  score               NUMERIC(5, 4),
  identifiers_compared JSONB NOT NULL,        -- what agreed and what conflicted
  disposition         TEXT NOT NULL CHECK (disposition IN ('pending', 'auto_cleared', 'cleared',
                        'escalated', 'true_match')),
  reason              TEXT,
  decided_by          TEXT,                   -- 'system' or the reviewer
  decided_at          TIMESTAMPTZ,
  suppress_until      TIMESTAMPTZ,            -- a good-guy suppression, re-evaluated on list change
  FOREIGN KEY (list_version_id, entry_uid) REFERENCES sanctions_list_entries (list_version_id, entry_uid)
);

-- A block or reject, and its report.
CREATE TABLE sanctions_actions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id             UUID NOT NULL REFERENCES cases (id),
  screening_hit_id    UUID NOT NULL REFERENCES screening_hits (id),
  action              TEXT NOT NULL CHECK (action IN ('blocked', 'rejected')),
  program_authority   TEXT NOT NULL,          -- the program, CFR part or order
  value_usd           BIGINT NOT NULL,        -- minor units; 0 for rejected trade documents
  blocked_account_id  UUID REFERENCES accounts (id),  -- the separate interest-bearing account
  journal_entry_id    UUID REFERENCES journal_entries (id),
  acted_at            TIMESTAMPTZ NOT NULL,
  report_due_on       DATE NOT NULL,          -- 10 business days
  reported_at         TIMESTAMPTZ,
  ofac_report_ref     TEXT,
  unblocked_at        TIMESTAMPTZ,            -- with the license that released it
  license_ref         TEXT,
  CHECK (action = 'rejected' OR blocked_account_id IS NOT NULL)
);
```

The 50 percent rule runs as a fixed-point loop: start from listed parties (a confirmed `true_match`), add every entity whose blocked owners' stakes sum to 50% or more, and repeat until a pass adds nothing. Each derived entity is stored with its basis, because it won't appear on any file OFAC publishes:

```sql
CREATE TABLE sanctions_derived_blocks (       -- blocked by ownership, not by listing
  party_id            UUID PRIMARY KEY REFERENCES parties (id),
  basis               JSONB NOT NULL,         -- each blocked owner and its stake
  aggregate_pct       NUMERIC(7, 4) NOT NULL CHECK (aggregate_pct >= 50),
  list_version_ids    UUID[] NOT NULL,        -- the lists the listed owners came from
  computed_at         TIMESTAMPTZ NOT NULL
);

CREATE VIEW blocked_parties AS
  SELECT DISTINCT s.party_id
  FROM screenings s
  JOIN screening_hits h ON h.screening_id = s.id AND h.disposition = 'true_match'
  WHERE s.party_id IS NOT NULL
  UNION
  SELECT party_id FROM sanctions_derived_blocks;

-- One pass; the job repeats it until it inserts no rows.
INSERT INTO sanctions_derived_blocks (party_id, basis, aggregate_pct, list_version_ids, computed_at)
SELECT r.subject_party_id,
       jsonb_agg(jsonb_build_object('owner', r.related_party_id, 'pct', r.ownership_pct)),
       SUM(r.ownership_pct),
       '{}',                                  -- filled from the owners' screenings
       NOW()
FROM party_relationships r
JOIN blocked_parties b ON b.party_id = r.related_party_id
WHERE r.kind = 'equity_owner' AND upper_inf(r.valid_during)
GROUP BY r.subject_party_id
HAVING SUM(r.ownership_pct) >= 50
ON CONFLICT (party_id) DO NOTHING;
```

On the worked example, the first pass adds X (55%), the second Y (60% through X), the third V (25% through Y plus B's 25%), and the fourth adds nothing. Z and W never qualify. A derived block feeds screening as an internal list entry with its reason ("owned 55% by blocked persons"), and a change to any ownership edge or to the lists reruns the loop.

Design notes:

- **Screening is a gate in the posting path,** like an authorization: an outbound payment order can't post until its screening has no pending hits, and an account in sanctions review is `restricted` with only initial deposits allowed.
- **A new list version is an event** (`sanctions_list.loaded`) that rescreens affected parties and pending payments, and re-evaluates suppressions whose entries changed.
- **Record the matcher configuration as a version** with the threshold and normalization rules, so every past decision can be replayed ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Blocked funds move by journal entry** into the blocked account's GL, and accrue interest like any deposit; release is another entry referencing the license.
- **Retention is ten years** from the transaction, and for blocked property ten years after unblocking, so `retain_until` is computed per row, not from a global policy ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).

## Auditing

Sanctions compliance is tested in every BSA/AML exam, by independent testing, by sponsor banks over their programs and, after a violation, by OFAC. Keep:

- **Every list version** with its source, hash, completeness check and load time, and the time between OFAC's publication and the bank's load.
- **Every screening** with its subject, trigger, list versions and matcher configuration, for at least ten years.
- **Every hit and its disposition,** with the identifiers compared, the reason, the decider and the time, and every suppression with its expiry.
- **Every block and reject:** the property, value, authority, blocked account and its entries, the report and its date against the 10-business-day deadline, the annual reports, and any license and release.
- **Tuning evidence:** the threshold per product, the test set and results that justified it, and retests after changes.
- **Coverage:** customers and payment types in scope and proof each was screened, including rescreens after each list update.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Treat screening as a gate,** not a report: payments don't post and restricted accounts don't transact until hits are cleared.
- **Store every list version and check its completeness on load;** rescreen on every update.
- **Screen customers, their owners and signers, and payments,** including the free-text and bank-identifier fields of payment messages.
- **Compute 50 percent rule ownership** from the bank's own ownership data, as an internal list with reasons.
- **Match names loosely and decide on identifiers,** with normalization, a threshold per product under change control, and a labeled test set.
- **Record what was compared and why** for every cleared hit, and expire suppressions on list changes.
- **Block into a separate interest-bearing account by journal entry,** reject without processing, and report both within 10 business days.
- **Keep sanctions records for ten years,** not the BSA's five.
- **Measure the interval from designation to action;** it is an enforcement factor.

## References

**Law and regulation**

- [31 CFR 501.601: Records and recordkeeping requirements](https://www.law.cornell.edu/cfr/text/31/501.601), ten years after the transaction and ten years after unblocking
- [31 CFR 501.603: Reports of blocked property](https://www.law.cornell.edu/cfr/text/31/501.603), the 10-business-day initial report, its contents, and the annual report as of June 30 due September 30
- [31 CFR 501.604: Reports on rejected transactions](https://www.law.cornell.edu/cfr/text/31/501.604), the 10-business-day report, contents, valuation and the OFAC Reporting System
- [31 CFR part 501, Appendix A: Economic Sanctions Enforcement Guidelines](https://www.law.cornell.edu/cfr/text/31/appendix-A_to_part_501), the general factors and the base penalty matrix
- [Federal Register: Reporting, Procedures and Penalties Regulations, 89 FR 74832 (September 13, 2024)](https://www.federalregister.gov/api/v1/documents/2024-20674.json), the interim final rule extending recordkeeping from five to ten years, effective March 12, 2025
- [Federal Register: Sanctions Penalties Regulations, 91 FR 60821 (September 25, 2026)](https://www.federalregister.gov/api/v1/documents/2026-19678.json), the new 31 CFR part 505 consolidating penalty information
- [Federal Register: Removing Duplicative Penalties Information and Reorganizing Certain Parts, 91 FR 61727 (September 30, 2026)](https://www.federalregister.gov/api/v1/documents/2026-20007.json), duplicative penalty provisions removed from program parts

**Regulators and guidance**

- [OFAC: FAQ 65](https://ofac.treasury.gov/faqs/65), civil penalties based on strict liability, without knowledge
- [OFAC: Entities owned by blocked persons (50% Rule) FAQs](https://ofac.treasury.gov/faqs/topic/1521), aggregation, indirect ownership, control and divestiture
- [OFAC: Assessing OFAC Name Matches](https://ofac.treasury.gov/faqs/topic/1591), the six review steps, blocking or rejecting, and reporting within 10 business days
- [OFAC: Weak Aliases FAQs](https://ofac.treasury.gov/faqs/topic/1646), what weak AKAs are, how they are marked and screening expectations
- [OFAC: How to Search OFAC's Sanctions Lists](https://ofac.treasury.gov/faqs/topic/1636), Sanctions List Search's fuzzy logic, scores, the 2021 algorithm change and ID matching
- [OFAC: FAQ 287](https://ofac.treasury.gov/faqs/287), Sanctions List Search not for automated systems, and the data files instead
- [OFAC: Sanctions List Search](https://sanctionssearch.ofac.treas.gov/), the Minimum Name Score and OFAC's refusal to recommend a threshold
- [OFAC: A Framework for OFAC Compliance Commitments (May 2019)](https://ofac.treasury.gov/media/16331/download?inline), the five essential components and the screening software root causes
- [OFAC: Civil Penalties and Enforcement Information](https://ofac.treasury.gov/civil-penalties-and-enforcement-information), 2026 actions and totals
- [OFAC: 2025 Enforcement Information](https://ofac.treasury.gov/civil-penalties-and-enforcement-information/2025-enforcement-information), 2025 actions and totals
- [FFIEC BSA/AML Manual: Office of Foreign Assets Control](https://bsaaml.ffiec.gov/manual/OfficeOfForeignAssetsControl/01), blocking and rejecting, licenses, reporting, risk assessment, interdiction software sensitivity, screening timing, ACH and IAT responsibilities, SARs and OFAC, and the program's components

**Vendor documentation**

- [ComplyAdvantage: API documentation](https://docs.complyadvantage.com/), searches, fuzziness, match statuses, monitored searches and false-positive suppression
- [Middesk: Business review tasks](https://docs.middesk.com/reference/business-review-tasks.md), the watchlist task and task statuses
- [Persona: Reports](https://docs.withpersona.com/docs/reports), watchlist, PEP and adverse media reports and recurring reports
- [Plaid: Monitor](https://plaid.com/docs/monitor/), sanctions and PEP screening, programs and sensitivity, daily rescreening and hit statuses
- [Socure](https://www.socure.com/), Global Watchlist Screening on RiskOS
