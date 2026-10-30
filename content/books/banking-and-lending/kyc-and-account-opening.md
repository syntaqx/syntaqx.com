+++
title = "KYC & Account Opening"
description = "Opening an account under the CIP and CDD rules: identity data, verification, beneficial owners after 2026, vendors, eCBSV, ChexSystems, synthetics, KYB."
category = "Banking & Lending Industry"
order = 2420
part = "Financial Crime"
tags = ["banking", "kyc", "cip", "cdd", "beneficial-ownership", "identity-verification", "account-opening"]
+++

Every account starts with the same question: who is this? A bank answers it under the Bank Secrecy Act, which turns "know your customer" into rules with field lists, verification methods, failure procedures and five-year records. The **Customer Identification Program** rule (31 CFR 1020.220) sets the minimum for every new account: four pieces of identifying information collected before opening, verified within a reasonable time, compared against government lists, kept for years after the account closes. The **customer due diligence** rule (31 CFR 1010.230 and the program rule in 1020.210) adds the people behind a business and an understanding of what the account is for. Neither rule cares whether the applicant came through a branch, a bank's app or a fintech's onboarding screen on a sponsor bank's charter: the customer is the bank's, and the program is the bank's.

Account opening is also where most fraud is cheapest to stop. A fabricated identity, a stolen one, a mule recruited to open an account for someone else and a business that exists only on paper all have to get through this step, and once they have an account with a debit card and a P2P handle they are the bank's problem in every later chapter of this part. So the opening flow carries two duties at once: the regulatory one (form a reasonable belief that you know the customer's true identity) and the commercial one (don't open accounts that will be used to steal), with the data each needs and the records an examiner will sample.

This chapter is the bank's side of that flow: the CIP and CDD rules as they stand in October 2026, the identity vendors and data sources banks and programs use, the deposit screening reports from ChexSystems and Early Warning, synthetic identities, and KYB for business accounts. The provider's version for merchants (KYC, KYB, underwriting and monitoring of the businesses a payment platform pays out to) is in [Merchant Onboarding](/books/payments/merchant-onboarding#know-who-you-re-paying), and the AML program that consumes what this chapter collects is [BSA/AML Programs](/books/banking-and-lending/bsa-aml).

## How the Platforms Do It

What identity and account-opening vendors document publicly, as of October 2026:

| Vendor | What it sells | Main objects | Outcomes it documents |
| --- | --- | --- | --- |
| **Alloy** | Identity and fraud decisioning that orchestrates data sources into a bank's or fintech's policy | Entities (person and business), evaluations (a workflow run on a payload), journeys and journey applications, workflows; an Events API for ongoing monitoring; case management | Journey application statuses from `running` through `pending_step_up`, `pending_action`, `waiting_review` and `data_request` to the terminal `completed` and `error`; a `complete_outcome` (Approved, Denied, or manual review) only when completed |
| **Early Warning (Certos)** | Bank-owned data on deposit accounts and payments, sold under the Certos brand | Verify Identity, Predict New Account Risk, Verify Account (ownership and status in real time), Deposit Chek, Payment Chek, Wire Chek | Account-level risk and verification results drawn from participating banks' data |
| **Middesk** | Business verification (KYB) | A Business, with review tasks for name, address, TIN, Secretary of State match and status, watchlist, people, industry and adverse media | Business statuses `open`, `pending`, `in_audit`, `in_review` ("ready to be reviewed by you"), then `approved` or `rejected` set by the client; each task `success`, `warning`, `failure` or `neutral` |
| **Persona** | Configurable identity verification flows and reports | Inquiries (one run of a flow from a versioned template), verifications (government ID, selfie, document, database), reports (watchlist, PEP, adverse media), accounts linked by reference ID | Inquiry statuses `created`, `pending`, `completed`, `failed`, `expired` (24 hours by default), then `needs review`, `approved` or `declined` from post-inquiry review |
| **Plaid Identity Verification** | Document, selfie, database and phone checks in one session, with watchlist screening | Templates; sessions (a new ID on each retry); steps `accept_tos`, `verify_sms`, `kyc_check`, `documentary_verification`, `selfie_check`, `watchlist_screening`, `risk_check` | Session `active`, `success`, `failed`, `expired`, `canceled`, `pending_review`; only failed steps can be overridden |
| **Socure** | Identity, synthetic and first-party fraud scores, document verification, watchlist screening, eCBSV and deceased checks on its RiskOS platform | Products (Sigma Identity Fraud, Sigma Synthetic Fraud, Sigma First-Party Fraud, Predictive DocV, Global Watchlist Screening, eCBSV) | Scores and decisions on its platform; it says it serves "19 of 20 top U.S. banks" (its claim) |

Three things stand out. **Every vendor separates the check from the decision.** A Persona inquiry can complete and still need review; a Plaid session can fail one step and be overridden by a person; an Alloy evaluation runs the institution's workflow, not the vendor's opinion. The bank's CIP says what result forms a reasonable belief, and the vendor's output is evidence for it. **Manual review is a designed state, not an exception:** each one has a review status, which is where the cases a good flow produces (thin files, recent movers, name changes, new immigrants) go. **The record of what was checked is the vendor's ID plus your copy.** Every vendor returns a reference the bank can pull later, but the CIP rule makes the bank keep the description of what it relied on and how discrepancies were resolved, so the result has to land in the bank's records, not only the vendor's dashboard.

## The CIP Rule

The rule applies to a bank's **customer**, meaning a person who opens a new **account**: a formal banking relationship to provide or engage in services, dealings or financial transactions, including deposit, credit, safekeeping, cash management and trust relationships (31 CFR 1020.100). It excludes services with no formal relationship (check cashing, a wire for a walk-in, a money order sale), accounts acquired through a merger or asset purchase, and ERISA plan accounts. It excludes as customers other regulated financial institutions, certain government and listed entities, and an existing customer whose identity the bank reasonably believes it already knows. A person opening an account for a minor or an unincorporated association is the customer.

The program must be written, part of the bank's AML program, and "appropriate for the bank's size and type of business." It has six parts:

1. **Minimum information before opening** (1020.220(a)(2)(i)): name; date of birth for an individual; address (a residential or business street address for an individual, or an APO/FPO box or a next of kin's address for someone without one, and the principal place of business or other physical location for an entity); and an identification number. For a US person that is a taxpayer identification number. For a non-US person it is one or more of a TIN, a passport number and issuing country, an alien identification card number, or the number and issuing country of another unexpired government-issued document showing nationality or residence with a photograph or similar safeguard.
2. **Verification within a reasonable time** after opening, by documents, non-documentary methods or both, with the CIP saying when each is used (1020.220(a)(2)(ii)). Documents for a person are an unexpired government photo ID; for an entity, certified articles of incorporation, a government-issued business license, a partnership agreement or a trust instrument. Non-documentary methods include contacting the customer, comparing the information against a consumer reporting agency, public database or other source, checking references with another financial institution, and obtaining a financial statement. Non-documentary procedures are required where the person can't present an unexpired photo ID, the bank is unfamiliar with the documents, the account is opened without the customer appearing in person, or other circumstances raise the risk. For an entity the bank can't otherwise verify, it may obtain information about the individuals with authority or control over the account.
3. **What happens when verification fails** (1020.220(a)(2)(iii)): when the bank should not open the account, the terms under which a customer may use it while verification is pending, when to close it after attempts fail, and when to file a SAR.
4. **Records** (1020.220(a)(3)): the identifying information obtained, a description of each document relied on, the methods and results of non-documentary checks, and the resolution of each substantive discrepancy. Identifying information is kept five years after the account closes (for a credit card, five years after it closes or becomes dormant); the rest is kept five years after the record is made.
5. **Comparison with government lists** of known or suspected terrorists or terrorist organizations designated for CIP purposes, within a reasonable time after opening (1020.220(a)(4)). The FFIEC's manual notes that OFAC's lists have not been designated for this purpose: sanctions screening is a separate, stricter obligation with its own timing ([Sanctions Screening](/books/banking-and-lending/sanctions-screening#when-to-screen)).
6. **Customer notice** before opening that the bank is requesting information to verify identity, in a lobby sign, on a website or on the application (1020.220(a)(5)), for which the rule gives sample language.

Three exceptions shape real flows. A customer who has **applied for a TIN** but not received it may open an account if the bank confirms the application was filed and obtains the number within a reasonable time. For **credit card accounts**, the bank may obtain the identifying information from a third-party source before extending credit, so a card application need not ask for everything the CIP needs. And on **June 27, 2025** FinCEN issued an order letting banks supervised by the OCC, FDIC and NCUA obtain the TIN from a third party rather than the customer (Federal Reserve-supervised banks followed in a July 31, 2025 order), on condition that the CIP still lets the bank obtain the TIN before opening and form a reasonable belief about identity; use of the exemption is optional. The design consequence is a flow that can ask for the last four digits of an SSN and complete the rest from a reputable source, with the source recorded as the CIP's basis.

**Reliance** (1020.220(a)(6)) lets a bank rely on another financial institution, including an affiliate, for any CIP step, but only if the reliance is reasonable, the other institution is subject to an AML program rule and regulated by a federal functional regulator, and it contracts to certify annually that it has implemented its AML program and performs the CIP steps. A fintech program manager is neither, which is why a sponsor bank cannot "rely" on its fintech in the regulatory sense: the fintech performs the CIP as the bank's agent under the program agreement, to the bank's written CIP, and the bank answers for it. That split, and what the bank checks, is [Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight)'s subject; the data requirement is that the program's records are the bank's records and producible on demand.

## Customer Due Diligence and Beneficial Owners

The program rule for banks (31 CFR 1020.210) requires, alongside internal controls, independent testing, a designated compliance person and training, "appropriate risk-based procedures for conducting ongoing customer due diligence": understanding the nature and purpose of each customer relationship to develop a **customer risk profile**, and ongoing monitoring to identify and report suspicious transactions and, on a risk basis, to maintain and update customer information, including beneficial ownership for legal entities. In software, the risk profile is a stored object with its inputs (product, expected activity, occupation or industry, geography, channel), the rating it produced and the policy version that produced it; [BSA/AML Programs](/books/banking-and-lending/bsa-aml#the-customer-risk-profile) is where it is used.

The beneficial ownership rule (31 CFR 1010.230) applies to a **legal entity customer**: a corporation, LLC or other entity created by a filing with a state office, a general partnership, or a similar foreign entity, opening an account. It excludes sixteen categories (regulated financial institutions, SEC- and CFTC-registered entities, public accounting firms, bank holding companies, state-regulated insurers, governmental bodies and others), and certain pooled investment vehicles and nonprofits get only the control prong. At account opening the bank identifies and verifies:

- **Each individual who owns 25% or more of the equity,** directly or indirectly (the ownership prong). If a trust holds the stake, the trustee is the beneficial owner.
- **One individual with significant responsibility to control, manage or direct the entity** (the control prong): an executive officer or senior manager such as a CEO, CFO, COO, managing member, general partner, president, vice president or treasurer, or anyone who regularly performs similar functions.

Identification can be the rule's certification form (Appendix A) signed by the person opening the account, or any other means if that person certifies the information to the best of their knowledge. Verification of each individual's identity follows the bank's CIP procedures for individuals, may use photocopies, and may rely on the information the customer supplies about who its owners are unless the bank knows facts that call it into question. Records of identification are kept five years after the account closes; records of verification five years after they are made. Exempt from the identification and verification steps are point-of-sale retail credit accounts up to $50,000 and accounts that only finance postage, insurance premiums or equipment paid directly to the provider, unless the account can make payments to third parties or pays out a cash refund.

**Worked numbers: who gets verified.** An LLC opens a business checking account. Its operating agreement shows five members holding 30%, 25%, 20%, 15% and 10%, and a hired CEO who owns nothing. The ownership prong catches the 30% and 25% members; the 20%, 15% and 10% members are not beneficial owners, however much they own together. The control prong adds one person, and the bank may pick the CEO or any member who manages the company; if the 30% member is also the managing member, the bank may name her under both prongs and verify two people in total. A company with four 25% owners has four ownership-prong owners plus a control person who may be one of them. A company with five 20% owners has none under ownership and exactly one under control, which is the case the control prong exists for. The bank stores each owner as a party linked to the business, with the percentage and the prong, not as fields on the business.

### What changed in 2026

Two things moved and one did not:

- **Beneficial owners once, not at every account.** On February 13, 2026 FinCEN issued exceptive relief (under 31 USC 5318(a)(7) and 31 CFR 1010.970) from the requirement to identify and verify beneficial owners each time a legal entity customer opens a new account. A covered institution may limit it to the customer's first account opening, when it learns facts that call the existing information into question, and as its risk-based ongoing due diligence requires. Use is optional and the relief can be revoked; FinCEN reissued its consolidated CDD FAQs to match, including that institutions need not solicit or update beneficial ownership information as a matter of course during periodic reviews absent risk-based concerns. The design consequence: beneficial ownership belongs to the business party, not the account, with a "last verified" date and a trigger for refresh.
- **The CTA registry no longer covers US companies.** The Corporate Transparency Act's beneficial ownership reports, which companies file with FinCEN directly, were narrowed by an interim final rule on March 26, 2025 and made permanent by a final rule published and effective August 14, 2026 (91 FR 52508): reporting companies need not report US-person beneficial owners or US-person company applicants. Banks can't substitute FinCEN's registry for their own collection.
- **The bank's CDD duty is unchanged.** The 2016 CDD rule still applies to every legal entity customer, and the CTA-mandated revision of it had not been proposed as of October 2026.

## Verifying Identity in Software

A modern opening flow runs the non-documentary path first and falls back to documents, because the first is invisible to most applicants and the second costs conversion. The usual order, which the vendor objects above all implement:

1. **Collect the four CIP elements** and the notice, plus contact data (phone, email) and device signals. With the TIN exemption, collect the last four of the SSN and complete it from a source.
2. **Match the elements against authoritative and commercial data:** credit bureau headers, public records, phone and email tenure, and, where the applicant consents, the Social Security Administration's eCBSV.
3. **Score for fraud,** separately from verification: an identity can be real and stolen, or entirely fabricated and still match a bureau file that the fraudster built.
4. **Step up when needed:** a document scan and selfie with liveness, a one-time code to a phone, a knowledge question, a call.
5. **Screen** against sanctions lists and the CIP terrorist lists ([Sanctions Screening](/books/banking-and-lending/sanctions-screening)).
6. **Decide under the written CIP:** open, open with restrictions pending verification, refer to review, or decline, with the CIP failure procedure (including a SAR referral) where verification fails.

**eCBSV** (electronic Consent Based SSN Verification, 42 USC 405b) exists, in the statute's words, to "reduce the prevalence of synthetic identity fraud." Section 215 of the Economic Growth, Regulatory Relief, and Consumer Protection Act (May 24, 2018) directed SSA to let permitted entities (financial institutions and their service providers, affiliates and agents) submit a name, SSN and full date of birth with the consumer's written consent, which may be electronic under E-SIGN, and receive a confirmation or non-confirmation, for a credit transaction or other FCRA permissible purpose. It is fee-funded; fees cut effective April 7, 2025 run from $5,100 a year for up to 10,000 verifications (Tier 1) to $5,878,125 a year for up to 200 million (Tier 12). Because consent is a condition, it is a `disclosures` row with the consent text, and because it answers only "these three match an SSN record", it is one input to verification, not the verification.

**Document verification** reads the ID (barcode, MRZ, security features), compares the photo to a live selfie, and checks the data against what was typed. It is the documentary method the CIP names, but in a remote flow the bank never sees the physical document, which is why the CIP treats non-face-to-face opening as a circumstance requiring non-documentary procedures as well.

**Authentication is not identity.** A verified identity tells you who opened the account; it doesn't tell you who is logging in next month. The credentials, devices and phone numbers bound at opening are what [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams#account-takeover) protects.

## Deposit Screening: ChexSystems and Early Warning

Lenders pull credit reports; deposit account openers pull **checking account reports**. The CFPB's list of consumer reporting companies puts two in its "check and bank account screening" category: **Chex Systems, Inc.**, which "collects and reports data on checking account applications, openings, and closures, including reasons for account closure" (the list, current as of January 2025, says it is owned by the eFunds subsidiary of FIS), and **Early Warning Services**, co-owned by Bank of America, Capital One, JPMorgan Chase, PNC, Truist, U.S. Bank and Wells Fargo, which also runs Zelle and Paze and now sells its account-opening and verification products under the Certos brand.

Both are consumer reporting agencies, so the Fair Credit Reporting Act applies to the bank that uses them:

- **A denial based on the report is adverse action.** Under 15 USC 1681m(a), the bank must notify the applicant, name the agency with its address and phone number, say that the agency did not make the decision, and tell the applicant of the right to a free copy within 60 days and to dispute the information. That notice is a `disclosures` row.
- **Closures for cause are furnished.** What a bank reports about a closed account (unpaid overdraft, suspected fraud) is what the next bank sees. The CFPB's consumer guide says involuntary closures "can stay on your checking account report for up to seven years, depending on the company", and that some companies disregard information once it's five years old.
- **The report is not a CIP verification.** It tells you how the applicant's past accounts ended; it doesn't by itself establish identity.

The policy question in this decade has been whether a report of an unpaid $200 overdraft should keep someone out of the banking system entirely. A bank's choices are to decline, to open a restricted or fee-free account instead, or to open normally, and my rule is that the decline criteria are a controlled list in the decision record so the bank can show consistent, written, risk-based criteria ([Closing Accounts](/books/banking-and-lending/dormancy-and-escheat#closing-accounts) covers the same rule for closures).

## Synthetic Identities

The Federal Reserve defines **synthetic identity fraud** as "the use of a combination of personally identifiable information (PII) to fabricate a person or entity in order to commit a dishonest act for personal or financial gain." The classic synthetic pairs a real SSN (often a child's, an elderly person's or a never-used one) with an invented name and date of birth, applies for credit until a bureau creates a file, builds the file with small, well-paid accounts, and then "busts out": draws every line and disappears. There is no victim to complain, so the loss is usually booked as a credit loss rather than fraud, and the Fed's materials put losses only at "billions" annually; I have not found a primary-source figure worth citing.

Why ordinary checks miss them:

- **A bureau match proves the file exists, not the person.** The synthetic built the file.
- **The SSN may be valid and unused in any visible way,** which is exactly what eCBSV was created to test: SSA knows whose SSN it is.
- **Documents can be forged to match,** and a selfie matches the forged document.

Signals that work are about the identity's history and its neighbors, not its fields: an SSN that SSA's eCBSV won't confirm with the name and date of birth, credit history that begins in adulthood with authorized-user tradelines, a phone or email with no history before the application, and many applications sharing an address, device, phone or email. That last one is a graph problem: link applications by shared attributes and look for clusters ([Record Linkage](/docs/architecture/record-linkage#match-before-create) covers the matching side). Vendors sell synthetic-specific scores (Socure's Sigma Synthetic Fraud among them), and a bank combines them with eCBSV and its own linkage.

## KYB: Business Accounts

A business account adds three things to the person's flow:

- **The entity is verified as an entity.** Legal name, formation and good standing with the Secretary of State, address, EIN (matched against IRS records through a vendor), industry, and what the business says it does. Middesk's task list (name, address, TIN, SOS match and active status, watchlist, people, industry, adverse media) is a fair outline of what a bank checks.
- **The people are verified as people.** Each beneficial owner and the control person go through the person's CIP verification, and so do authorized signers, who are customers' agents on the account even when they are not owners.
- **The structure is understood.** A company owned by another company means following the chain until individuals appear, which is where sanctions' aggregate ownership rule meets CDD's 25% rule ([The 50 Percent Rule](/books/banking-and-lending/sanctions-screening#the-50-percent-rule)). Sole proprietors are individuals with a trade name, not legal entity customers.

Business banking for startups, with sub-accounts, user permissions and multiple sponsor banks, is the subject of [Business Accounts & Startup Banking](/books/banking-and-lending/business-accounts); the payment-provider version, where the business is a merchant to be paid, is [Merchant Onboarding](/books/payments/merchant-onboarding).

## When Verification Fails

The CIP's failure procedure is where most findings live, because it is where the flow has to do something other than "approve":

- **Don't open** when the bank can't form a reasonable belief and the risk doesn't allow a provisional account.
- **Open restricted.** Many programs open the account with funding allowed and outbound transfers, card spend and P2P blocked until verification completes, with an expiry. The restriction is an account status and a set of holds or controls, not a flag on the user record.
- **Close after failed attempts,** returning any funds by a method that doesn't send them to an unverified third party.
- **Refer for a SAR** when the failure looks deliberate (a document that is fake, an identity that belongs to a deceased person, a cluster of applications).

The other half is **discrepancy resolution.** A name that doesn't match the bureau by one letter, an address the bureau doesn't have, a date of birth off by a day: the CIP requires the bank to record how each substantive discrepancy was resolved. That record is what the examiner samples, so a manual review that clicks "approve" without a reason is a finding even when the customer was legitimate.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). `party_identities` already stores each verified identifier with its method and result; the tables below add the verification runs that produced those results, the CIP determination per application, deposit screening, and the business's owners.

```sql
-- One verification run: a vendor inquiry, evaluation or session, or a manual review.
CREATE TABLE identity_verifications (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  application_id      UUID REFERENCES applications (id),
  vendor              TEXT NOT NULL,          -- 'alloy', 'persona', 'plaid', 'socure', 'ssa_ecbsv', 'manual'
  vendor_ref          TEXT,                   -- the inquiry, evaluation or session ID
  template_version    TEXT NOT NULL,          -- the vendor template or workflow version that ran
  method              TEXT NOT NULL CHECK (method IN ('documentary', 'non_documentary', 'both')),
  checks              JSONB NOT NULL,         -- per check: name, result, matched fields, score
  vendor_outcome      TEXT NOT NULL,          -- as the vendor returned it
  consent_disclosure_id UUID REFERENCES disclosures (id),  -- eCBSV and similar consents
  started_at          TIMESTAMPTZ NOT NULL,
  completed_at        TIMESTAMPTZ,
  reviewed_by         TEXT,                   -- set when a person overrode or decided
  review_reason       TEXT
);

-- The CIP determination for one application: did the bank form a reasonable belief?
CREATE TABLE cip_determinations (
  application_id      UUID NOT NULL REFERENCES applications (id),
  party_id            UUID NOT NULL REFERENCES parties (id),  -- each customer on the application
  cip_version         TEXT NOT NULL,          -- the written CIP in force
  info_collected      JSONB NOT NULL,         -- which elements, from the customer or a third party
  tin_source          TEXT NOT NULL CHECK (tin_source IN ('customer', 'third_party', 'applied_for')),
  notice_disclosure_id UUID NOT NULL REFERENCES disclosures (id),
  outcome             TEXT NOT NULL CHECK (outcome IN ('verified', 'open_restricted', 'pending',
                        'not_verified_declined', 'not_verified_closed')),
  restriction_expires_at TIMESTAMPTZ,         -- for open_restricted
  discrepancies       JSONB NOT NULL DEFAULT '[]',  -- each: field, what differed, how resolved, by whom
  sar_referral_case_id UUID REFERENCES cases (id),  -- an aml_investigation case, if referred
  list_check_at       TIMESTAMPTZ,            -- 1020.220(a)(4) comparison
  decided_at          TIMESTAMPTZ NOT NULL,
  retain_until        DATE,                   -- set when the account closes: close date + 5 years
  PRIMARY KEY (application_id, party_id)
);

-- Checking account reports pulled at opening (FCRA consumer reports).
CREATE TABLE deposit_screenings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id      UUID NOT NULL REFERENCES applications (id),
  party_id            UUID NOT NULL REFERENCES parties (id),
  agency              TEXT NOT NULL,          -- 'chexsystems', 'early_warning'
  product             TEXT NOT NULL,
  report_ref          TEXT NOT NULL,
  result              JSONB NOT NULL,         -- closures, inquiries, scores as returned
  used_in_decline     BOOLEAN NOT NULL DEFAULT FALSE,
  adverse_action_disclosure_id UUID REFERENCES disclosures (id),
  pulled_at           TIMESTAMPTZ NOT NULL,
  CHECK (NOT used_in_decline OR adverse_action_disclosure_id IS NOT NULL)
);

-- Who owns and controls a business party; reused by sanctions ownership checks.
CREATE TABLE party_relationships (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_party_id    UUID NOT NULL REFERENCES parties (id),  -- the business
  related_party_id    UUID NOT NULL REFERENCES parties (id),  -- a person or another business
  kind                TEXT NOT NULL CHECK (kind IN ('equity_owner', 'control_person',
                        'trustee', 'general_partner', 'officer')),
  ownership_pct       NUMERIC(7, 4),          -- direct stake; null for control-only roles
  cdd_prong           TEXT CHECK (cdd_prong IN ('ownership', 'control')),  -- set if a beneficial owner
  source              TEXT NOT NULL,          -- 'certification', 'registry', 'documents', 'vendor'
  certification_ref   TEXT,                   -- the signed certification, as a document
  verified_at         TIMESTAMPTZ,
  valid_during        TSTZRANGE NOT NULL,
  CHECK (subject_party_id <> related_party_id)
);

ALTER TABLE parties
  ADD COLUMN beneficial_owners_verified_at TIMESTAMPTZ,  -- FIN-2026 relief: refresh on trigger
  ADD COLUMN cip_exempt_reason TEXT;          -- 'regulated_fi', 'existing_customer', ...
```

Design notes:

- **CIP belongs to the party and the application, beneficial ownership to the business.** `cip_determinations` is per application and per customer on it, because each new account is a CIP event unless the existing-customer exclusion applies; `party_relationships` and `beneficial_owners_verified_at` are on the business, because after February 2026 a bank may verify owners once and refresh them on a trigger.
- **Vendor output is stored, then interpreted.** `identity_verifications.checks` and `vendor_outcome` are as returned; the CIP outcome is the bank's, with its version. When the vendor template changes, old decisions still show what ran ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Restricted opening is a status and controls.** `open_restricted` sets the account to `restricted` with an expiry and blocks outbound rails until `verified`; a scheduled job closes accounts whose restriction expired, through the CIP failure procedure.
- **Identity data is the most sensitive data you hold.** SSNs, ID images and selfies are vaulted, tokenized and access-logged ([Encryption at Rest](/docs/security/encryption-at-rest), [Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)), and retention follows the CIP schedule, not a product's general deletion policy ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).
- **Emit `party.verified`, `application.cip_decided` and `party.owners_changed`,** which monitoring, sanctions rescreening and the program's dashboards subscribe to.

The control query: every open account has a verified CIP determination for each owner, or a restriction that hasn't expired.

```sql
SELECT a.id AS account_id, ap.party_id, cd.outcome, cd.restriction_expires_at
FROM accounts a
JOIN account_parties ap ON ap.account_id = a.id
  AND ap.role IN ('owner', 'joint_owner') AND upper_inf(ap.valid_during)
JOIN applications app ON app.account_id = a.id
LEFT JOIN cip_determinations cd ON cd.application_id = app.id AND cd.party_id = ap.party_id
JOIN parties p ON p.id = ap.party_id
WHERE a.status NOT IN ('closed', 'charged_off')
  AND p.cip_exempt_reason IS NULL
  AND (cd.outcome IS NULL
       OR cd.outcome NOT IN ('verified', 'open_restricted')
       OR (cd.outcome = 'open_restricted' AND cd.restriction_expires_at < NOW()));
```

## Auditing

CIP and beneficial ownership are tested in every BSA/AML exam and every sponsor bank's review of its programs. Per customer, the bank must be able to produce:

- **The four elements as collected,** with where each came from (the customer or a third party under the 2025 TIN order) and the notice shown before opening.
- **What verification relied on:** a description of each document (type, issuer, number, expiry), each non-documentary method and its result, and each vendor run with its template version.
- **How every substantive discrepancy was resolved,** by whom and why.
- **The CIP outcome** under the CIP version in force, and for failures, the restriction, closure or SAR referral that followed.
- **For businesses,** the owners and control person identified, the certification or other means, their verification, and when the information was last verified or refreshed.
- **For deposit screening,** the report used and any adverse action notice sent.

Retention: CIP identifying information five years after the account closes, verification records five years after they are made, and the same split for beneficial ownership. A program that exits a sponsor bank, or a bank that converts its core, must carry these records with the accounts, because the clock runs from closure, not from migration. The record mechanics are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Write the CIP as data:** which elements, which methods for which channel, what result forms a reasonable belief, and what happens on failure, versioned and referenced by every determination.
- **Collect the four elements and the notice before opening,** and record whether the TIN came from the customer or a third party.
- **Run non-documentary checks first, documents as step-up,** and score fraud separately from verification.
- **Store vendor results as returned and the bank's decision beside them,** with template and CIP versions.
- **Make "open restricted" a real state** with an expiry, blocked outbound rails and an automatic path to verification or closure.
- **Record how each discrepancy was resolved;** it is what the examiner samples.
- **Model owners as parties related to the business,** with percentage, prong, source and last-verified date, and refresh on triggers rather than at every account.
- **Treat checking account reports as consumer reports:** adverse action notices, and accurate furnishing on closures.
- **Link applications by shared attributes** to find synthetic and mule clusters.
- **Keep CIP records on their own retention clock,** across program exits and conversions.

## References

**Law and regulation**

- [31 CFR 1020.100: Definitions](https://www.law.cornell.edu/cfr/text/31/1020.100), "account" and "customer" for the CIP and their exclusions
- [31 CFR 1020.220: Customer identification program requirements for banks](https://www.law.cornell.edu/cfr/text/31/1020.220), the four elements, TIN and credit card exceptions, verification methods, failure procedures, records, list comparison, notice and reliance
- [31 CFR 1020.210: Anti-money laundering program requirements for banks](https://www.law.cornell.edu/cfr/text/31/1020.210), the program components and risk-based customer due diligence
- [31 CFR 1010.230: Beneficial ownership requirements for legal entity customers](https://www.law.cornell.edu/cfr/text/31/1010.230), the 25% and control prongs, legal entity customer and its exclusions, exemptions, records and reliance
- [42 USC 405b: Reduction of synthetic identity fraud](https://www.law.cornell.edu/uscode/text/42/405b), eCBSV: permitted entities, fraud protection data, written or electronic consent and confirmation
- [15 USC 1681m: Requirements on users of consumer reports](https://www.law.cornell.edu/uscode/text/15/1681m), the adverse action notice for decisions based on a consumer report
- [Federal Register: Beneficial Ownership Information Reporting Requirement Revision, 91 FR 52508 (August 14, 2026)](https://www.federalregister.gov/api/v1/documents/2026-16576.json), the final rule exempting US-person beneficial owners and company applicants from CTA reporting
- [Federal Register: SSA eCBSV fee notice, 2025-05905 (April 7, 2025)](https://www.federalregister.gov/documents/full_text/html/2025/04/07/2025-05905.html), the reduced fee tiers and consent requirement

**Regulators and guidance**

- [FinCEN: FinCEN Permits Banks to Use Alternative Collection Method for Obtaining TIN Information (June 27, 2025, updated July 31, 2025)](https://www.fincen.gov/news/news-releases/fincen-permits-banks-use-alternative-collection-method-obtaining-tin-information), the TIN exemptive orders, conditions and the optional use
- [FinCEN: FinCEN Issues Exceptive Relief to Streamline Customer Due Diligence Requirements (February 13, 2026)](https://www.fincen.gov/news/news-releases/fincen-issues-exceptive-relief-streamline-customer-due-diligence-requirements), beneficial owners at first account opening, on doubt and on risk-based review
- [FinCEN: Exceptive Relief from Requirement to Identify and Verify Beneficial Owners at Each Account Opening](https://www.fincen.gov/system/files/2026-02/FinCEN-Order-CCDExceptiveRelief.pdf), the order, its authority, optional use and revocability
- [FFIEC BSA/AML Manual: Office of Foreign Assets Control](https://bsaaml.ffiec.gov/manual/OfficeOfForeignAssetsControl/01), OFAC lists not designated for the CIP list comparison
- [Federal Reserve FedPayments Improvement: Synthetic Identity Payments Fraud](https://fedpaymentsimprovement.org/strategic-initiatives/payments-security/synthetic-identity-payments-fraud/), the definition of synthetic identity fraud
- [CFPB: List of consumer reporting companies (2025, CSV)](https://files.consumerfinance.gov/f/documents/cfpb-consumer-reporting-companies_list_2025.csv), ChexSystems and Early Warning as check and bank account screening companies, their descriptions and owners
- [CFPB: Consumer guide to being denied a checking account](https://files.consumerfinance.gov/f/documents/cfpb_adult-fin-ed_consumer-guide-to-being-denied-a-checking-account.pdf), how long involuntary closures stay on checking account reports and the free annual report

**Vendor documentation**

- [Alloy: Developer documentation](https://developer.alloy.com/), entities, evaluations, journeys, events and case management
- [Alloy: Application statuses](https://developer.alloy.com/public/docs/application-statuses.md), journey application statuses and `complete_outcome`
- [Certos (Early Warning): Product overview](https://www.certos.com/product-overview), account opening, account verification and deposit and payment risk products
- [Early Warning: About](https://www.earlywarning.com/about), bank ownership and Zelle and Paze
- [Middesk: Lifecycle of a business](https://docs.middesk.com/lifecycle-of-business.md), business statuses from open to approved or rejected
- [Middesk: Business review tasks](https://docs.middesk.com/reference/business-review-tasks.md), the KYB task keys and task statuses
- [Persona: Inquiries](https://docs.withpersona.com/docs/inquiries), inquiries from templates and reference IDs
- [Persona: Model lifecycle](https://docs.withpersona.com/docs/model-lifecycle), inquiry statuses and the 24-hour expiry
- [Plaid: Identity Verification](https://plaid.com/docs/identity-verification/), templates, sessions and retries
- [Plaid: Identity Verification API](https://plaid.com/docs/api/products/identity-verification/), session and step statuses and overrides of failed steps
- [Socure](https://www.socure.com/), RiskOS products including synthetic fraud scoring, eCBSV and its bank customer claim
