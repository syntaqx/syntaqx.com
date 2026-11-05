+++
title = "Qualified Custody"
description = "The custody rule and crypto: qualified custodians, state trust companies, OCC trust banks, NYDFS, bank custody after SAB 121, segregation and insurance."
category = "Investing & Digital Assets Industry"
order = 2552
part = "Institutional Crypto"
tags = ["crypto", "custody", "qualified-custodian", "advisers-act", "trust-charter", "occ", "nydfs"]
+++

An institution that holds crypto for someone else has to answer a question a retail exchange can postpone: is the place the coins sit a place the law accepts? A registered investment adviser with custody of client assets must keep them at a "qualified custodian," a fund must keep them with a custodian the Investment Company Act accepts, an ETP's sponsor must name a custodian in its registration statement, and a pension or endowment's own policies usually require the same. For most of crypto's history the answer was uncertain, because the rule's list of qualified custodians was written for banks and broker-dealers, the rule assumes an asset that a custodian can hold in an account, and a bearer asset controlled by a private key fits neither assumption cleanly. Between 2021 and 2026 that changed: the OCC chartered crypto trust banks, the SEC's staff accepted state trust companies, the accounting rule that kept banks out was rescinded, and in October 2026 the SEC proposed crypto custody rules.

For an engineer the consequence is that "qualified" is a property of an arrangement, not of a vendor. It depends on which legal entity holds the asset, under what charter, in what account structure, with what control over the keys, under what agreement, with what audit and what insurance, and each of those has to be a record a client's auditor can test. This chapter covers the Advisers Act custody rule and how crypto strains it, state trust companies and the September 2025 no-action letter, the October 2026 proposal, OCC trust charters and the bank permissions behind them, NYDFS trust companies, bank custody after SAB 121's rescission, control, segregation and bankruptcy remoteness, and insurance. It extends `legal_entities` and `wallets` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business with `custody_arrangements`, `custody_attestations` and `insurance_policies`. The licensing map is [Trust Charters for Custody](/books/investing-and-digital-assets/regulators-and-licenses#trust-charters-for-custody) in Regulators & Licenses; the charters themselves are Banking & Lending's [Trust Banks and Novel Charters](/books/banking-and-lending/charters-and-regulators#trust-banks-and-novel-charters); the platforms built on these entities are [Custody Platforms & Policy Engines](/books/investing-and-digital-assets/custody-platforms).

## How the Custodians Do It

The regulated entities behind the main institutional custodians, as of November 2026:

| Custodian | Entity that holds the assets | Charter and regulator | What the public record adds |
| --- | --- | --- | --- |
| **Anchorage Digital** | Anchorage Digital Bank, National Association | National trust bank, OCC; conditionally approved January 13, 2021 as a conversion of a South Dakota trust company | A 2022 BSA/AML consent order, terminated August 21, 2025; describes "HSM-secured cold storage," biometric approvals and SOC 1 and SOC 2 Type II audits; named additional bitcoin custodian to the iShares Bitcoin Trust |
| **BitGo** | BitGo Bank & Trust, N.A.; BitGo New York Trust Company; BitGo Custody MENA | National trust bank, OCC (conversion conditionally approved December 12, 2025); NYDFS trust company; Dubai VARA | Qualified custody "100% supported by cold storage"; "up to $250 million of insurance coverage for digital assets held in qualified custody" |
| **Coinbase** | Coinbase Custody Trust Company, LLC | New York limited purpose trust company, NYDFS | Custodian to "several Bitcoin and Ethereum ETF issuers," including the iShares Bitcoin Trust; liability cap in that agreement the greater of $5 million or the prior 12 months' fees, with $100 million per cold-storage address |
| **Fidelity Digital Assets** | Fidelity Digital Assets, National Association | National trust bank, OCC (conversion conditionally approved December 12, 2025) | Client services since 2019; trades "without moving assets from cold storage" |
| **Paxos** | Paxos Trust Company, N.A. | National trust bank, OCC (conversion conditionally approved December 12, 2025) | Also a stablecoin issuer ([Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin)) |
| **BNY** | The Bank of New York Mellon | National bank, OCC, Federal Reserve | Describes itself as "the first G-SIB to offer regulated digital asset custody and services"; cash custodian and administrator to the iShares Bitcoin Trust |

The pattern is convergence on a trust charter. Every specialist custodian holds client crypto in a trust company or trust bank rather than in the exchange or software company that carries the brand, because a trust entity holds assets as a fiduciary or custodian rather than as a debtor, has its own capital and examiner, and is the kind of institution the custody rules name. The OCC's December 2025 decisions moved three state trust companies to national charters and added two de novo trust banks for stablecoin issuers, joining "approximately 60 other national trust banks."

## The Custody Rule

Rule 206(4)-2 under the Investment Advisers Act makes it a fraudulent practice for a registered adviser to have custody of client funds or securities unless it meets the rule's conditions. Custody is broad: "holding, directly or indirectly, client funds or securities, or having any authority to obtain possession of them," which includes authority to withdraw assets on instruction to a custodian. An adviser with trading authority over a client's crypto account at a platform that would let it move coins out has custody. The conditions:

- **A qualified custodian holds the assets**, in a separate account per client in the client's name, or in accounts holding only clients' assets under the adviser's name as agent or trustee.
- **Notice to the client** of the custodian's name, address and how the assets are held, updated when it changes.
- **Account statements at least quarterly** sent by the custodian directly to the client, showing every holding at period end and every transaction; the adviser needs "a reasonable basis, after due inquiry," to believe they go out.
- **An annual surprise examination** by an independent public accountant, at a time the accountant picks "without prior notice or announcement," with Form ADV-E filed within 120 days and material discrepancies reported to the SEC within one business day.
- **More if the custodian is related.** If the adviser or a related person is the qualified custodian, the accountant must be PCAOB-registered and inspected, and the adviser must get an annual internal control report that includes verification that assets are reconciled to a custodian that isn't the adviser or its related person.

A pooled vehicle (a private fund) can satisfy the statements and surprise examination conditions instead by an annual audit under Regulation S-X with audited statements delivered to investors within 120 days of year end.

The list of qualified custodians is short: a bank or savings association as defined in the Advisers Act, a registered broker-dealer holding client assets in customer accounts, a registered futures commission merchant for certain futures-related assets, and a foreign financial institution that customarily holds financial assets and segregates client assets. Crypto strains three parts of it:

- **Which custodians.** The Act's definition of a bank (section 202(a)(2)) includes a "trust company" doing business under state or federal law, "a substantial portion of the business of which consists of receiving deposits or exercising fiduciary powers similar to those permitted to national banks," and "which is supervised and examined by State or Federal authority having supervision over banks." The question for state-chartered crypto trust companies was whether they meet it, supervision by a banking authority especially. National trust banks plainly do; state trust companies were a judgment call until 2025.
- **What custody means for a bearer asset.** A securities custodian holds an entitlement on its books and its own account at DTC. A crypto custodian holds a key, and whoever else holds a copy of that key can move the asset. The bank regulators' 2025 statement (below) defines control in those terms, and the October 2026 proposal does too.
- **Funds or securities.** The rule covers "funds or securities." Whether a given token is a security changes whether the rule applies at all, which is [Securities, Commodities & Crypto Market Structure](/books/investing-and-digital-assets/securities-or-commodities)'s question; most advisers and custodians treat all client crypto as in scope rather than classify asset by asset, and my default is the same.

The SEC proposed replacing the rule with a broader safeguarding rule covering all client assets, crypto included, on March 9, 2023 (88 FR 14672). It withdrew that proposal with others on June 17, 2025 (90 FR 25531), so Rule 206(4)-2 governed unchanged until the 2026 proposal. How adviser platforms run the rule day to day is [The Custody Rule and the Withdrawn Safeguarding Proposal](/books/investing-and-digital-assets/advisor-platforms#the-custody-rule-and-the-withdrawn-safeguarding-proposal) in RIA Custodians & Advisor Platforms.

## State Trust Companies and the 2025 No-Action Letter

On September 30, 2025, the staff of the SEC's Division of Investment Management issued a no-action letter saying it "would not recommend enforcement action to the Commission against advisers or regulated funds" that treat a state trust company as a bank for crypto custody purposes, under conditions the letter sets. The SEC's own 2026 release describes the letter that way and notes that staff statements have "no legal force or effect" and do not change the law. I haven't opened the letter itself, so I describe its conditions through the 2026 proposal, which turns a version of them into rule text. <!-- source-gap: state-trust-nal-conditions | missing | the September 30, 2025 IM no-action letter's exact conditions (diligence, policies, audited financials, internal control report, segregation, rehypothecation) | closes with: the letter on sec.gov (returned 503 when fetched) | checked: 2026-11-05 -->

What the letter changed in practice: an adviser or fund could use a New York, South Dakota, Wyoming or other state trust company as a qualified custodian without first concluding on its own legal analysis that the trust company met the Act's bank definition. That opened the field to custodians that had not converted to national charters, and it is why the October 2026 proposal names state trust companies explicitly.

## The October 2026 Proposal

On October 6, 2026, the SEC published "Adviser and Regulated Fund Custody Rules; Crypto Custody Rules" (91 FR 63870, Release Nos. IA-7023 and IC-36353, File No. S7-2026-35), with comments due December 7, 2026. As of November 2026 it is a proposal, nothing in it binds, and Rule 206(4)-2 still applies. From the release's overview:

- **Redesignation.** Rule 206(4)-2 would become Rule 223-1 (17 CFR 275.223-1), and new Investment Company Act rules would govern how regulated funds hold crypto securities, with amendments to Forms ADV, ADV-E and N-CEN.
- **State trust companies as permitted custodians.** An adviser would need a reasonable basis to believe a state trust company is authorized by its state and "maintains and implements written policies and procedures" for safeguarding, would review its audited financial statements and internal control reports, and client crypto would be "segregated from the State trust company's proprietary assets."
- **Adviser self-custody as a last resort.** Where "a permitted custodian is not available" for a crypto asset, an adviser could hold it itself, after a written determination reassessed at least quarterly, with key management that protects key materials "against loss and unauthorized access," exclusive possession of the key materials, joint authorization of transfers by at least two designated persons including at least one management person, segregation by address ("storing only such client's crypto assets"), cybersecurity controls, internal control reports, and quarterly statements. Self-custody is defined as "possession of any portion of a client crypto asset's key materials," so an adviser holding one MPC share is self-custodying.
- **Questions on tokenized fund shares**, which bear on [Tokenized Treasuries & Funds](/books/investing-and-digital-assets/tokenized-funds).

For a custodian, the self-custody conditions read as a specification of what the SEC thinks custody of a key requires: exclusive possession, a two-person rule with a named senior approver, one client per address where the adviser holds keys, and periodic independent reporting on controls. A custodian whose platform can't produce those facts per client will find advisers asking for them under the final rule.

## National Trust Banks and the OCC

A national trust bank is chartered and examined by the OCC, takes no insured deposits, and can exercise fiduciary powers across states under one supervisor. Anchorage was first: on January 13, 2021, the OCC conditionally approved the conversion of Anchorage Trust Company, a South Dakota trust company, to Anchorage Digital Bank, N.A., with an operating agreement on capital, liquidity and risk management as an enforceable condition. A BSA/AML consent order followed in 2022 and was terminated on August 21, 2025. On December 12, 2025 the OCC conditionally approved de novo charters for First National Digital Currency Bank (Circle) and Ripple National Trust Bank, and conversions of BitGo, Fidelity Digital Assets and Paxos from state trust companies; the approvals are conditional, with the conditions in the decision documents.

Two interpretive letters set what any national bank, not only a crypto trust bank, may do:

- **Interpretive Letter 1183 (March 7, 2025)** removed the requirement that banks obtain supervisory nonobjection before crypto custody, certain stablecoin activities and participation in distributed ledger networks, which the OCC had imposed in Interpretive Letter 1179 (November 18, 2021), while saying it expects "the same strong risk management controls" as for traditional activities. It reaffirmed the custody authority of Interpretive Letter 1170.
- **Interpretive Letter 1184 (May 7, 2025)** confirmed that banks "may buy and sell assets held in custody at the customer's direction" and may outsource custody and execution to third parties, including sub-custodians, "subject to appropriate third-party risk management practices."

Together they make a bank's crypto custody look like its securities custody: permitted without special approval, executable on instruction, and outsourceable to a sub-custodian for which the bank remains responsible.

## NYDFS Trust Companies

New York's limited purpose trust companies are the oldest crypto custody charters still in use (Coinbase Custody Trust Company is one), and New York's custody guidance is the most specific statement of how a custodian must structure its books. The September 30, 2025 industry letter, which replaced the January 2023 guidance and applies to BitLicensees and New York trust companies, requires segregation on chain and in internal ledgers, allows omnibus wallets holding "only virtual currency of customers" in the custodian's name as agent or trustee with up-to-date beneficial interest records, forbids a debtor-creditor relationship and any use of customer assets for the custodian's purposes, and treats a new sub-custody arrangement as "a material change" needing prior approval. [Omnibus Custody](/books/investing-and-digital-assets/crypto-exchange-architecture#omnibus-custody) in How a Crypto Exchange Works lists the requirements; what the 2025 letter adds is sub-custody:

- **Due diligence first**, before arranging sub-custody.
- **A regulated sub-custodian**: chartered or licensed by NYDFS, or regulated at home under a regime the Department deems "substantially similar" in its "sole discretion."
- **Agreement terms**: the sub-custodian acknowledges NYDFS requirements, keeps customer assets segregated from both the custodian's and its own, and titles accounts and wallets "F/B/O."
- **No liens**: customer assets can't collateralize the custodian's proprietary obligations or be subject to set-off or liens beyond customary fees and expenses.

## Bank Custody After SAB 121

From March 2022 to January 2025, SEC Staff Accounting Bulletin 121 told public companies that safeguard crypto for others to record a liability for the obligation and a matching asset at fair value. For a bank, a balance sheet liability equal to every coin held for customers carries capital consequences that securities custody never had, and banks that report to the SEC largely stayed out. SAB 122, released January 23, 2025 and effective January 30, 2025, rescinded it; an entity now decides whether to recognize a liability for risk of loss under ASC 450-20 or IAS 37, like any other contingency. [Accounting for Crypto & Treasury Companies](/books/investing-and-digital-assets/crypto-accounting#sab-121-and-sab-122) covers the accounting.

On July 14, 2025, the Fed, FDIC and OCC issued a joint statement, "Crypto-Asset Safekeeping by Banking Organizations," which says it "does not create any new supervisory expectations" and is the clearest regulatory statement of what custody of crypto is:

- **Control is the test.** Safekeeping "entails controlling the cryptographic keys," and a bank has control when it can "reasonably demonstrate" that "no other party, including the customer, has access to information sufficient to unilaterally transfer the crypto-asset out of the control of the banking organization."
- **Taking keys isn't taking control.** A bank that "simply takes possession of existing cryptographic keys may not have control," because the customer may have kept copies; initial control usually requires an on-chain transfer to the bank.
- **Fiduciary or not.** Banks may safekeep in a fiduciary capacity (subject to 12 CFR 9 or 150 for national banks and federal savings associations) or a non-fiduciary one set by contract.
- **Account model.** Omnibus accounts "may permit greater efficiencies but could also create larger targets for theft"; separate accounts mean more key pairs to manage.
- **Sub-custodians.** The bank "is responsible for the activities performed by the sub-custodian," applies the same control standard to it, and should analyze how customer assets would be treated in the sub-custodian's insolvency; commingling at the sub-custodian "could risk the crypto-assets being treated as property of the sub-custodian."
- **Audit** should cover key generation, storage and deletion, transfer and settlement controls, and the supporting systems.

## Control, Segregation and Bankruptcy Remoteness

Qualified custody exists to protect the client when the custodian fails. Three things decide whether it does:

- **Title.** The agreement must say the client owns the assets and the custodian holds them as custodian or trustee. Celsius's Earn terms transferred title to Celsius, and the bankruptcy court held those coins were estate property ([Terms decide bankruptcy](/books/investing-and-digital-assets/crypto-exchange-architecture#terms-decide-bankruptcy)). Coinbase's 10-K relies on UCC Article 8 for the position that assets it holds for customers in the US are "not property of Coinbase and not subject to claims of our general creditors," while warning that custodially held crypto "may be considered to be the property of a bankruptcy estate."
- **Segregation the records can prove.** The ledger has to show, for every wallet, which clients' assets are in it, and the on-chain balance has to reconcile to it. A segregated wallet per client proves itself on chain; an omnibus wallet proves itself only through the ledger, which is why NYDFS insists on beneficial interest records and reconciliation on request.
- **The right resolution regime.** A bank can't be a debtor under the Bankruptcy Code (11 USC 109(b)(2) excludes a "bank"), so a trust bank's failure is a receivership under banking law rather than a bankruptcy case, and the safekeeping statement's fiduciary and contract capacities are what keep customer assets out of the bank's own estate. A state trust company's failure runs under its state's law. A software company or an exchange without a trust entity goes through bankruptcy, where the court decides title. The resolution path for each entity is a legal question for counsel; the system's job is records that let any of them run. "Bankruptcy remote" in a custodian's marketing means the assets sit in an entity and under terms designed so the brand's failure doesn't reach them.

The test I apply to an arrangement is the one the joint statement implies: if this custodian failed tonight, could a receiver hand each client its coins from the records alone, without the custodian's staff and without a court deciding who owns what? If the answer needs a judge, the arrangement isn't finished.

## Insurance

Custody insurance is smaller than custody, and the public record shows how much smaller:

- **BitGo** reports "up to $250 million of insurance coverage for digital assets held in qualified custody," against about $81.6 billion of assets on platform at December 31, 2025.
- **The iShares Bitcoin Trust** discloses that the insurance Coinbase Global maintains "is shared among all of Coinbase's customers" and that the crime coverage of Anchorage's parent, Anchor Labs, with a minimum limit of $100 million, may be shared with its other customers, so the Trust's claim competes with other clients'.
- **No deposit insurance.** BNY's page states that digital assets "are not insured by the FDIC, are not deposits, and may lose value," and Anchorage that digital assets in custody "are not guaranteed by Anchorage Digital."

A worked illustration of a shared policy, my own numbers: a custodian holds $40 billion for 2,000 clients under a $250 million aggregate crime policy. A key compromise drains $600 million from one omnibus cold wallet holding 300 clients' coins. The policy pays at most $250 million (less any deductible), the remaining $350 million is the custodian's to cover from capital or the clients' to bear, and any later loss in the policy year finds the aggregate already used up. Coverage is an aggregate per policy year, not per client and not per wallet, so a custodian's insurance tells a client what the custodian can absorb, not what the client will recover. The records that matter are the policy's limit, its exclusions (insider theft, key loss without theft, losses in hot wallets), the aggregate remaining and which wallets it covers.

## How to Build It

`legal_entities` already carries `kind` values for `trust_company` and `national_trust_bank`; `entity_registrations` in [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses) records the charter. Three tables make an arrangement's qualification a record rather than a claim:

```sql
CREATE TABLE custody_arrangements (        -- who holds which client's assets, under what terms
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  custodian_entity_id   UUID NOT NULL REFERENCES legal_entities (id),  -- the trust entity, never the brand
  sub_custodian_entity_id UUID REFERENCES legal_entities (id),        -- null: held directly
  capacity              TEXT NOT NULL CHECK (capacity IN ('fiduciary', 'non_fiduciary',
                          'agent', 'trustee')),
  account_model         TEXT NOT NULL CHECK (account_model IN ('segregated', 'omnibus')),
  qualification_basis   TEXT NOT NULL CHECK (qualification_basis IN ('national_bank',
                          'state_trust_company', 'state_trust_nal_2025', 'broker_dealer',
                          'foreign_institution', 'not_qualified')),
  agreement_version     TEXT NOT NULL,       -- the signed custody agreement
  title_clause          TEXT NOT NULL,       -- what the agreement says about ownership
  rehypothecation_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  statement_recipient   UUID REFERENCES parties (id),  -- custodian statements go here directly
  approved_by_regulator_at TIMESTAMPTZ,      -- NYDFS sub-custody approval, where required
  valid_during          TSTZRANGE NOT NULL,
  CHECK (sub_custodian_entity_id IS NULL OR approved_by_regulator_at IS NOT NULL
         OR qualification_basis <> 'state_trust_company')
);

ALTER TABLE wallets ADD COLUMN custody_arrangement_id UUID REFERENCES custody_arrangements (id);

CREATE TABLE custody_attestations (        -- the evidence an auditor or client asks for
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  custodian_entity_id   UUID NOT NULL REFERENCES legal_entities (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('soc1_type2', 'soc2_type2',
                          'surprise_exam', 'internal_control_report', 'audited_financials',
                          'regulator_exam', 'key_ceremony_attestation')),
  period                DATERANGE NOT NULL,
  issuer                TEXT NOT NULL,       -- the accounting firm or regulator
  exceptions_noted      INT NOT NULL DEFAULT 0,
  document_uri          TEXT NOT NULL,
  received_at           TIMESTAMPTZ NOT NULL
);

CREATE TABLE insurance_policies (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  insured_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('crime', 'specie', 'cyber',
                          'errors_omissions', 'directors_officers')),
  aggregate_limit_cents BIGINT NOT NULL,
  per_loss_limit_cents  BIGINT,
  deductible_cents      BIGINT NOT NULL,
  covered_wallet_purposes TEXT[] NOT NULL,   -- e.g. '{cold}': hot wallet losses often excluded
  shared_across_clients BOOLEAN NOT NULL,
  aggregate_used_cents  BIGINT NOT NULL DEFAULT 0,
  policy_period         DATERANGE NOT NULL,
  CHECK (aggregate_used_cents <= aggregate_limit_cents)
);
```

Three rules keep these honest. A wallet that holds client assets must name its arrangement, so a query can list every client whose coins are in a wallet and under which terms. An arrangement that loses its basis (a charter condition unmet, an attestation with exceptions, a sub-custodian whose approval lapses) raises a `cases` row against each affected account rather than silently continuing. And `qualification_basis` is a dated fact: when the 2026 proposal becomes a rule, arrangements resting on the no-action letter get re-papered under the rule, and the history shows which basis applied on which day.

## Auditing

What an adviser's accountant, a fund auditor, a regulator or a receiver asks a custodian for:

- **Every client's holdings by location**, per wallet and address, reconciled to the chain at a block, on a date the auditor picks without notice (the surprise examination is unannounced by rule).
- **Statements as sent**, quarterly or more often, directly to clients, with the transactions they listed.
- **The control evidence**: key ceremonies, the policy versions every transfer passed, approver identities, SOC reports and their exceptions ([Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#auditing) covers the signing records).
- **The arrangement on each date**: entity, charter, agreement version, sub-custodian and its approval.
- **Insurance in force** and its remaining aggregate on the date of any loss.

## What This Means for the System You Build

- Hold client crypto in a trust entity, never in the operating company, and put that entity on every wallet and arrangement row.
- Treat qualification as a dated record with its basis (charter, no-action letter, future rule), not a property of the vendor.
- Define control the way the bank regulators do: nobody else, the client included, can move the asset alone; deposit by on-chain transfer, never by handing over keys.
- Make omnibus wallets provable through the ledger and segregated wallets provable on chain, and reconcile both daily.
- Write title into the agreement and make the ledger tell the same story; Celsius is what happens when they disagree.
- Report insurance as an aggregate with exclusions, never as a per-client promise.
- Watch the October 2026 proposal: its adviser self-custody conditions are a preview of what clients will ask custodians to evidence.

## References

**Law and regulation**

- [17 CFR 275.206(4)-2](https://www.law.cornell.edu/cfr/text/17/275.206(4)-2), the custody definition, qualified custodian list, separate accounts, notice, quarterly statements, surprise examination, related-person custodians and the audited pooled vehicle alternative
- [SEC: Adviser and Regulated Fund Custody Rules; Crypto Custody Rules, proposed rule (91 FR 63870, October 6, 2026)](https://www.federalregister.gov/documents/2026/10/06/2026-20466/adviser-and-regulated-fund-custody-rules-crypto-custody-rules), release numbers, comment deadline, redesignation as Rule 223-1, state trust company conditions, adviser self-custody conditions and the description of the September 30, 2025 no-action letter ([API record](https://www.federalregister.gov/api/v1/documents/2026-20466.json))
- [SEC: Safeguarding Advisory Client Assets, proposed rule (March 9, 2023)](https://www.federalregister.gov/documents/2023/03/09/2023-03681/safeguarding-advisory-client-assets), the 2023 proposal
- [SEC: Withdrawal of Proposed Regulatory Actions (90 FR 25531, June 17, 2025)](https://www.federalregister.gov/documents/2025/06/17/2025-11110/withdrawal-of-proposed-regulatory-actions), withdrawal of proposals including 88 FR 14672

**Regulators and guidance**

- [OCC: News Release 2021-6, conditional approval of Anchorage Digital Bank (January 13, 2021)](https://www.occ.gov/news-issuances/news-releases/2021/nr-occ-2021-6.html), the conversion and the operating agreement condition
- [OCC: News Release 2025-16, Interpretive Letter 1183 (March 7, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-16.html), removal of the supervisory nonobjection requirement and the activities reaffirmed ([letter](https://www.occ.gov/topics/charters-and-licensing/interpretations-and-actions/2025/int1183.pdf): rescission of Interpretive Letter 1179 of November 18, 2021)
- [OCC: News Release 2025-42, Interpretive Letter 1184 (May 7, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-42.html), buying and selling custodied assets at customer direction and outsourcing to sub-custodians
- [OCC: News Release 2025-125, conditional approvals of national trust bank charters (December 12, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html), the five approvals and the count of national trust banks
- [Federal Reserve, FDIC and OCC: Joint statement on crypto-asset safekeeping (July 14, 2025)](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20250714a.htm), no new supervisory expectations ([statement PDF](https://www.federalreserve.gov/newsevents/pressreleases/files/bcreg20250714a1.pdf): control, possession of existing keys, fiduciary capacity, account models, sub-custodian responsibility and insolvency, audit)
- [NYDFS: Updated Guidance on Custodial Structures (September 30, 2025)](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20250930-updated-guidance-custodial-structures), segregation, omnibus wallets, reconciliation, no debtor-creditor relationship, sub-custody approval and agreement terms
- [SEC: Staff Accounting Bulletin 122](https://www.sec.gov/rules-regulations/staff-guidance/staff-accounting-bulletins/staff-accounting-bulletin-122), rescission of SAB 121, dates and ASC 450-20 / IAS 37

**Filings**

- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), the trust companies, the national charter, cold storage, insurance and assets on platform
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), Coinbase Custody Trust Company, ETF custody and the UCC Article 8 position
- [iShares Bitcoin Trust: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), the custodians, the liability cap and the shared crime coverage

**In practice**

- [American Banker: OCC terminates consent order against Anchorage Digital (August 21, 2025)](https://www.americanbanker.com/news/occ-terminates-consent-order-against-anchorage-digital), the termination and the 2022 order
- [Anchorage Digital: Custody](https://www.anchorage.com/platform/custody), the national trust bank, HSM-secured cold storage, biometric approvals, SOC reports and the no-guarantee statement
- [Fidelity Digital Assets](https://www.fidelitydigitalassets.com/), the national trust bank, launch of client services and trading from cold storage
- [BNY: Digital Assets](https://www.bny.com/corporate/global/en/solutions/platforms/digital-assets.html), the G-SIB custody claim and the no-FDIC-insurance statement
