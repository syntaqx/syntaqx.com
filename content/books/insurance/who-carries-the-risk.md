+++
title = "Who Carries the Risk"
description = "Stock, mutual, reciprocal, fraternal, Lloyd's, captives and cells, risk retention groups and mutual holding companies, and what each form means for your data."
category = "Insurance Industry"
order = 2704
part = "The Business"
tags = ["insurance", "corporate-structure", "mutuals", "captives", "data-model"]
+++

Every policy names one insurer, and the insurer is a legal entity with a form: a stock company owned by shareholders, a mutual owned by its policyholders, a reciprocal exchange whose policyholders insure each other through an attorney-in-fact, a fraternal society that insures its members, a syndicate at Lloyd's, a captive owned by the businesses it insures, a risk retention group chartered under a federal statute. The form decides who owns the surplus, who gets the profit, who elects the board, how the company raises capital, which state laws apply, and whether a guaranty fund stands behind the policy when the company fails.

Most of that sounds like corporate law, and most of it lands in the data. A mutual's policyholders are members with votes and dividend rights; a reciprocal's are subscribers who signed a power of attorney; a risk retention group's must own it and must be told in 10-point type that no guaranty fund covers them; a demutualizing life insurer has to compute each policyholder's share of surplus. This chapter covers each form as public law and filings describe it, and extends `insurers` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `insurer_relationships` (attorney-in-fact, pooling, holding company, cell and syndicate links) and the member records the forms require.

## How the Platforms Do It

| Form | Who owns it | Who runs it | Where its capital comes from | Example from public sources |
| --- | --- | --- | --- | --- |
| **Stock** | Shareholders, usually through a holding company | Board elected by shareholders | Equity, debt and retained earnings | Progressive, Travelers, Allstate (public holding companies) |
| **Mutual** | Policyholders, as members | Board elected by members | Retained surplus and surplus notes; no equity | Northwestern Mutual |
| **Mutual holding company** | Members own the holding company, which owns a majority of a stock insurer | Holding company board | The stock subsidiary can issue minority equity | Iowa Code 521A.14 as an enabling statute |
| **Reciprocal exchange** | Subscribers, who exchange insurance with each other | An attorney-in-fact under a power of attorney | Subscribers' surplus; the attorney-in-fact is paid a fee | Erie Insurance Exchange, with Erie Indemnity as attorney-in-fact |
| **Fraternal benefit society** | Members, under a lodge system | Society's elected governance | Member surplus; tax-exempt under 26 USC 501(c)(8) | Reported alongside life insurers in NAIC's life and fraternal tables |
| **Lloyd's syndicate** | Members (corporate and individual) who provide capital for a year of account | A managing agent | Members' funds at Lloyd's and a mutual Central Fund | 103 syndicates run by 57 managing agents at the end of 2025 |
| **Texas Lloyd's plan** | Underwriters writing through an attorney in fact | The attorney in fact | Underwriters' capital | Tex. Ins. Code chapter 941 |
| **Captive and protected cell** | The parent, association or group it insures, or a cell's participant | Parent or sponsor | Parent's capital; cells segregate assets by law | Vermont, with over 1,400 captives licensed to date |
| **Risk retention group** | Its insureds, who must be its owners | Domicile state regulator oversees | Members' capital | Liability Risk Retention Act groups |

Two columns matter more to the system than they look. **Who gets the profit** decides whether premium can be partly refunded as dividends, which a system must compute, allocate and report. **Who guarantees the policy** decides what the policy must disclose and what happens to open claims if the company fails ([When Insurers Fail](/books/insurance/when-insurers-fail)).

## Stock Companies and Holding Companies

A stock insurer is a corporation owned by shareholders, almost always a subsidiary of a holding company that owns several insurers and non-insurance businesses. Progressive, Travelers and Allstate each file one 10-K for the holding company and many statutory statements for the insurers beneath it, and the NAIC's group code ties those insurers together for market share ([The Insurance Landscape](/books/insurance/insurance-landscape#how-the-platforms-do-it)).

The holding company structure is regulated by the state where each insurer is domiciled, under its insurance holding company act: Iowa's chapter 521A, for one, requires registration of insurers in a holding company system, approval before anyone acquires control (presumed at 10% of voting securities), standards for transactions between affiliates, and an enterprise risk report. The practical consequences for software:

- **Money crosses entities.** A holding company's shared services (claims staff, technology, marketing) are billed to its insurers under cost-sharing agreements the regulator reviews, so expense allocation by legal entity is a reportable computation, not a management convenience.
- **Pooling.** Insurers in a group often pool their business: each writes policies on its own paper, then cedes all of it to a lead company and takes back a fixed percentage of the pool. NAIC reports that US intercompany pooling agreements were 58.9% of reinsured business in 2025. A policy written by one company of the group ends up, for statutory results, spread across all of them by the pooling percentages.
- **Dividends upstream are limited.** Iowa's version (521A.5) bars an "extraordinary" dividend until 30 days after notice to the commissioner without disapproval, and defines it as one that, with the prior twelve months' dividends, exceeds the greater of 10% of surplus at the preceding December 31 or the prior year's net income (net gain from operations for a life insurer). Worked, mine: a P&C insurer with $800 million of surplus and $65 million of net income can pay $80 million in twelve months as ordinary dividends; a $100 million dividend needs the 30-day clock. The holding company's cash depends on each subsidiary's statutory surplus and income, and the system has to track the rolling twelve months ([Solvency & Capital](/books/insurance/solvency-and-capital)).

## Mutuals and What Members Are Owed

A mutual has no shareholders; its policyholders are its members, elect its board, and own its surplus. A mutual can't sell stock, so it grows mainly from retained surplus, which is why the reorganizations below exist.

The visible economics are dividends. A mutual life insurer sells participating policies and returns part of its surplus each year as policyholder dividends. Northwestern Mutual announced on October 27, 2026 an expected dividend payout of $10.4 billion for 2027, its 156th consecutive year, about $8.9 billion of it to whole life policyowners, and repeats the legal point every system has to encode: "Neither the existence nor the amount of a dividend is guaranteed on any policy in any given policy year." The board declares a scale each year; the system applies it to each eligible policy, by contribution to surplus, and records the dividend option the owner chose (cash, reduced premium, paid-up additions, accumulation at interest). [Life Products as Data](/books/insurance/life-products) covers the dividend options and their effect on policy values.

P&C mutuals pay dividends too, less predictably: NAIC's industry figures show $5.7 billion of P&C policyholder dividends in 2025, which reduce surplus and appear in the statutory combined ratio ([The Ratios That Run the Business](/books/insurance/how-insurers-make-money#the-ratios-that-run-the-business)). Membership itself is data: who is a member (usually every policyholder of a participating policy, while it is in force), the record date for a vote, and notice of an annual meeting or a proposed reorganization.

## Mutual Holding Companies and Demutualization

A mutual that wants outside capital has two routes, and both are statutory processes with member votes and regulator approval.

**Reorganizing into a mutual holding company.** Iowa's statute (Iowa Code 521A.14, 2026) is typical. With the commissioner's approval after a public hearing, a domestic mutual reorganizes into a mutual insurance holding company and continues as a stock insurer; "all of the initial shares of the capital stock of the reorganized insurance company shall be issued to the mutual insurance holding company," the policyholders' membership interests become membership interests in the holding company, and the holding company "shall at all times own a majority of the voting shares." The stock company can then sell a minority stake. It may keep "mutual" in its name only if the name also includes "stock insurer" or "SI", a rule that tells you a company's name is not evidence of its form; store the form.

**Converting to stock (demutualization).** Iowa's chapter 508B governs a mutual life company converting to a stock company, and shows what a conversion plan must compute:

- **A closed block.** The participating policies in force on the conversion date are operated as a closed block "for the exclusive benefit of the policies and contracts included, for dividend purposes only," with assets allocated in an amount equal to their reserves and liabilities (or enough, with the block's future revenue, to support it), so existing dividend scales continue if experience does.
- **Consideration for membership.** Policyholders give up their membership interest (votes and the right to share in surplus) for consideration with "a value equal to the amount of the statutory surplus," in shares, cash, policy benefits, increased dividends or other forms the plan selects, "allocated among the policyholders in a manner which is fair and equitable."
- **A vote.** The plan needs approval by two-thirds of the policyholders voting, and the commissioner's approval after review.

A worked allocation, mine: a mutual with $1.2 billion of statutory surplus and 400,000 eligible policies allocates a fixed component of 20% equally (240 million / 400,000 = $600 per policy) and the remaining $960 million in proportion to each policy's actuarially computed contribution to surplus. A policy whose contribution is 0.0005% of the total receives 960,000,000 × 0.000005 = $4,800 plus the $600 fixed component. The system has to hold each policy's eligibility on the record date, its contribution computed by the actuarial method the plan describes, the form of consideration chosen or assigned, and the payment, and the closed block's assets and its policies have to stay identifiable for decades.

## Reciprocal Exchanges and the Attorney-in-Fact

A reciprocal (or interinsurance exchange) is an unincorporated association whose subscribers exchange insurance with one another; it has no employees and is run by an attorney-in-fact under powers of attorney the subscribers sign. Erie is the clearest public example, because the attorney-in-fact is a listed company that files a 10-K:

- **The structure.** Erie Insurance Exchange is a Pennsylvania-domiciled reciprocal with no employees or officers. Each subscriber (policyholder) signs a subscriber's agreement, "a limited power of attorney," appointing Erie Indemnity Company as attorney-in-fact, which it has been since its 1925 incorporation. The Exchange owns the property and casualty companies and Erie Family Life; Indemnity owns none of the Exchange.
- **The fee.** Indemnity keeps a management fee of up to 25% of the Exchange's direct and affiliated assumed premiums written, the rate set by Indemnity's board at least annually; it was 25% for 2025 and 2024. The Exchange sells only through independent agencies.
- **The numbers.** The Exchange wrote $12,957 million of direct and affiliated assumed premium in 2025, 71% personal lines; its policyholders' surplus was $10.1 billion under statutory accounting. 25% of $12,957 million is $3,239 million; Indemnity reported management fee revenue of $3,132 million for policy issuance and renewal services and $74 million for administrative services, $3,206 million together (my arithmetic on its figures; the difference reflects how Indemnity recognizes the fee as revenue, which the excerpt I read doesn't break down). Indemnity's 2025 net income was $559 million.

Three things follow for the system. The **insurer** on every Erie policy is the Exchange (or one of its companies), never Indemnity, which bears no underwriting risk; the policyholder's claim is against the Exchange's surplus. The **fee** is a contract computation on written premium, owed whether or not the business is profitable, so it needs the same premium entries as everything else and a rate effective-dated by board action. And the **subscriber agreement** is a document per policyholder, a power of attorney the system must be able to produce. Other reciprocals use the same structure under the same kind of statute; the NAIC MGA model act expressly excludes "the attorney-in-fact authorized by and acting for the subscribers of a reciprocal insurer" from the definition of an MGA ([What the Law Calls an MGA](/books/insurance/mgas-programs-and-fronting#what-the-law-calls-an-mga)).

## Fraternal Benefit Societies

A fraternal benefit society insures its members. Federal tax law exempts "fraternal beneficiary societies, orders, or associations" that operate "under the lodge system" and provide "the payment of life, sick, accident, or other benefits" to members or their dependents (26 USC 501(c)(8)). Fraternals file statutory statements on the life blank and appear in NAIC's life and fraternal market share tables beside commercial life insurers. For the system they are life insurers with two additions: membership in the society is a condition of coverage (a member record, a lodge or chapter, sometimes dues), and the society's governing documents are part of the insurance contract.

## Lloyd's

Lloyd's of London is a market, not an insurer. Members provide the capital; a syndicate is "formed when one or more members join together to provide capital and accept risks," set up for each year of account but usually continuing year to year; a managing agent runs one or more syndicates, employing the underwriters. At December 31, 2025 there were 57 managing agents and 103 syndicates (plus 7 special purpose arrangements and 6 "syndicates in a box"). Business comes in through more than 400 registered Lloyd's brokers and more than 3,000 local coverholders, firms with delegated authority to bind on syndicates' behalf ([Binding Authority and Program Administrators](/books/insurance/mgas-programs-and-fronting#binding-authority-and-program-administrators)). The market reported £57.9 billion of gross written premium and an 87.6% combined ratio for 2025.

Policyholder security comes from the **Chain of Security**, three links as of December 31, 2025:

| Link | What it is | Amount |
| --- | --- | --- |
| Syndicate assets | Premiums, held in trust by the managing agents, the first resource for claims | £95,297m |
| Funds at Lloyd's | Each member's capital deposited at Lloyd's, held in trust for that member's policyholders | £31,132m |
| Central assets | The Central Fund, available at the Council's discretion for claims members can't meet | £3,202m |

Lloyd's describes much of its capital as provided "on a subscription basis," underwriters joining together on a risk, so the "insurer" on a Lloyd's contract can be a list of syndicates, each with its share, for one year of account. A US system receiving Lloyd's business through a coverholder records each syndicate and share, because claims, premiums and statistics divide the same way. For US surplus lines business, federal law bars states from refusing placements with an alien insurer on the NAIC's Quarterly Listing of Alien Insurers (15 USC 8204); [Excess & Surplus Lines](/books/insurance/excess-and-surplus-lines) covers the placement rules.

Texas has its own, unrelated "Lloyd's plan": an entity writing insurance through underwriters (individuals, partnerships or associations) acting by an attorney in fact under a power of attorney (Tex. Ins. Code 941.001). As with a reciprocal, the system has to know which party bears the risk and which manages it.

## Captives and Protected Cells

A captive is an insurer owned by the businesses whose risks it insures. Vermont's statute defines the main kinds (8 V.S.A. 6001): a **pure captive** insures "risks of its parent and affiliated companies or controlled unaffiliated business"; an **association captive** insures its member organizations; an **industrial insured captive** insures the members of an industrial insured group; an **agency captive** is owned by insurance agencies and insures only risks placed through them; a **risk retention group** can also be organized as a captive under the federal act; and the statute lists **sponsored captives** and special purpose financial insurers as further kinds. Vermont describes itself as the largest captive domicile, with over 1,400 captives licensed to date.

A **protected cell** divides one insurer into legally separate pools. The NAIC's Protected Cell Company Model Act (adopted 1999) defines a protected cell as "an identified pool of assets and liabilities of a protected cell company segregated and insulated by means of this Act from the remainder of the protected cell company's assets and liabilities," and was written to let domestic insurers do insurance securitizations without an offshore vehicle. Sponsored captives, cell captives in Bermuda and Cayman, and the "segregated portfolio" structures insurtechs use (Lemonade reports a Cayman SPC and a Bermuda captive cell) all share the idea: the cell's assets pay only the cell's liabilities.

For data, a cell is an insurer-like entity: premiums, reserves, reinsurance and capital are tracked per cell, and the protected cell account at the bank must match the cell's books. A cession to a captive or cell is reinsurance, and the ceding insurer needs it collateralized or otherwise eligible for credit ([Reinsurance Operations](/books/insurance/reinsurance-operations)).

## Risk Retention Groups

A risk retention group (RRG) is a liability insurer owned by its members, all of whom are insureds and all of whose insureds are owners, as the NAIC puts it. Congress created the form in the Product Liability Risk Retention Act of 1981 and broadened it in the Liability Risk Retention Act of 1986, after liability coverage dried up for some industries. An RRG is chartered and regulated in one state and can write liability insurance for its members in every other state, which mostly can't regulate it. Under 15 USC 3902, a non-chartering state may require only certain things: compliance with its unfair claims settlement practices law, nondiscriminatory premium taxes, participation in mechanisms that apportion liability losses, designation of the commissioner as agent for process, examinations in limited cases, compliance with delinquency orders and deceptive practices laws, and licensing of the agents and brokers who sell its coverage. It may not require or permit the RRG to join the state's guaranty association.

Every policy must carry a notice in 10-point type that the group may not be subject to all of the state's insurance laws, including the line "State insurance insolvency guaranty funds are not available for your risk retention group." Before writing in a state, the RRG files its plan of operation or feasibility study there, and every state where it writes gets its annual statement, certified by an independent accountant with a loss reserve opinion from an actuary or loss reserve specialist. The NAIC adds that RRGs generally don't file rates and forms, and that multi-state RRGs are regulated under the accreditation program with risk-based capital and examination requirements like commercial insurers.

For the system: an RRG's `insurer_authorities` rows are registrations (`rrg_registered`), not admissions; its policies need the notice as a required form in every state; its members are parties with an ownership role on the RRG; and its claims are handled under each state's unfair claims law even though its rates aren't filed there.

## County Mutuals and Fronting Forms

Some forms exist mainly because of what they allow in one state. Root's 2025 10-K names a "Texas county mutual fronting arrangement" among its forward-looking risks and warns that "retention of business written by us or through our Texas county mutual arrangement could expose us to potential losses": a Texas county mutual issues the policies and the business flows to Root. The pattern is the same one [Fronting and Hybrid Fronting](/books/insurance/mgas-programs-and-fronting#fronting-and-hybrid-fronting) describes nationally: the form on the policy is the issuing company's, and the economics belong to someone else.

## How to Build It

The form is a column on `insurers`; the relationships between entities are their own effective-dated table:

```sql
CREATE TABLE insurer_relationships (       -- how entities in a group relate, over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  kind               TEXT NOT NULL CHECK (kind IN ('holding_company_parent',
                       'mutual_holding_company', 'attorney_in_fact', 'managing_agent',
                       'pool_participant', 'cell_of', 'sponsor_of', 'fronts_for')),
  from_party_id      UUID NOT NULL REFERENCES parties (id),  -- Erie Indemnity, the parent, the cell
  to_insurer_id      UUID NOT NULL REFERENCES insurers (id), -- the Exchange, the subsidiary
  share_bp           INT,                   -- pool share, ownership share
  fee_basis          TEXT,                  -- 'written_premium', 'earned_premium'
  valid_during       DATERANGE NOT NULL,
  document_id        UUID,                  -- the agreement as filed with the regulator
  EXCLUDE USING gist (kind WITH =, from_party_id WITH =, to_insurer_id WITH =,
                      valid_during WITH &&)
);

CREATE TABLE relationship_rates (          -- an attorney-in-fact fee, a pooling percentage
  relationship_id    UUID NOT NULL REFERENCES insurer_relationships (id),
  rate_bp            INT NOT NULL,          -- 2500 = 25%
  cap_bp             INT,                   -- the statutory or contractual maximum
  valid_during       DATERANGE NOT NULL,
  approved_by        TEXT NOT NULL,         -- 'board resolution 2025-12-...'
  EXCLUDE USING gist (relationship_id WITH =, valid_during WITH &&)
);

CREATE TABLE membership_interests (        -- members, subscribers, owners of an RRG
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  party_id           UUID NOT NULL REFERENCES parties (id),
  kind               TEXT NOT NULL CHECK (kind IN ('mutual_member', 'subscriber',
                       'rrg_owner', 'fraternal_member', 'cell_participant')),
  basis_policy_id    UUID REFERENCES policies (id),  -- membership through this policy
  valid_during       DATERANGE NOT NULL,
  agreement_doc_id   UUID                   -- subscriber's agreement, RRG membership
);

CREATE TABLE policyholder_dividends (      -- declared scales applied to policies
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  declaration_ref    TEXT NOT NULL,         -- the board's declaration and scale
  amount             BIGINT NOT NULL,       -- minor units
  option             TEXT NOT NULL CHECK (option IN ('cash', 'reduce_premium',
                       'paid_up_additions', 'accumulate', 'not_applicable')),
  payable_on         DATE NOT NULL
);

-- The attorney-in-fact fee for a period, from the same premium entries as everything else.
SELECT r.id AS relationship_id,
       SUM(pe.amount) AS premiums_written,
       SUM(ROUND(pe.amount * LEAST(rr.rate_bp, COALESCE(rr.cap_bp, rr.rate_bp)) / 10000.0))
         AS fee
FROM insurer_relationships r
JOIN relationship_rates rr ON rr.relationship_id = r.id
JOIN policies p ON p.insurer_id = r.to_insurer_id
JOIN policy_terms t ON t.policy_id = p.id
JOIN policy_transactions pt ON pt.policy_term_id = t.id
JOIN premium_entries pe ON pe.transaction_id = pt.id AND pe.kind = 'premium'
WHERE r.kind = 'attorney_in_fact'
  AND pe.accounting_date <@ rr.valid_during
  AND pe.accounting_date BETWEEN :period_start AND :period_end
GROUP BY r.id;
```

Design notes:

- **The insurer on a policy never changes because a relationship does.** Pooling, attorney-in-fact fees and fronting cessions are computed from the issuing insurer's records; they move money and results between entities without rewriting who issued the policy.
- **Forms drive required documents.** An RRG's notice, a reciprocal's subscriber agreement and a fraternal's membership are form-level rules: the product configuration attaches them by `insurers.form` and state, so a new product can't ship without them ([Products, Coverages & Forms](/books/insurance/products-and-coverages)).
- **Rates are approved, not edited.** An attorney-in-fact fee or a pooling percentage changes by board action or regulator approval on a date, and the rate row carries the approval reference.
- **Membership has a record date.** Dividends, votes and demutualization consideration are computed as of a date, from `membership_interests` valid then.

## Auditing

- **Every policy's risk-bearer.** For any policy, the issuing insurer, its form, its group on the policy date, and any fronting or pooling relationship that moved the risk, so a liquidation or guaranty association knows whose policy it is.
- **Fees and pooling recomputable.** Attorney-in-fact fees, intercompany pooling allocations and cost sharing reproduced from premium entries and the rates in force, as the domiciliary regulator's examiners will ask.
- **Member rights on any record date.** Who was a member, through which policy, for dividends, votes and any reorganization, with the documents (subscriber agreements, RRG notices) delivered.

## What This Means for the System You Build

- **Store the insurer's legal form explicitly,** never inferred from its name; a "Mutual" can be a stock insurer.
- **Model attorney-in-fact, holding company, pooling, cell and fronting links as effective-dated relationships** with their rates and approvals.
- **Compute fees, pooling and dividends from premium entries,** the same records statutory reporting uses.
- **Attach form-driven documents by rule:** RRG guaranty fund notices, subscriber agreements, membership terms.
- **Keep membership as data with a record date,** because dividends, votes and demutualization depend on it.
- **For Lloyd's and other subscription business, record every syndicate and share,** not one carrier.

## References

**Law and regulation**

- [15 USC 3902](https://www.law.cornell.edu/uscode/text/15/3902), what non-chartering states may require of a risk retention group, the 10-point guaranty fund notice, the bar on guaranty association membership, and the plan of operation and annual statement filings
- [15 USC 8204](https://www.law.cornell.edu/uscode/text/15/8204), states may not bar placements with alien insurers on the NAIC Quarterly Listing of Alien Insurers
- [26 USC 501](https://www.law.cornell.edu/uscode/text/26/501), subsection (c)(8): fraternal beneficiary societies under the lodge system providing life, sick, accident or other benefits
- [Iowa Code chapter 521A (PDF)](https://www.legis.iowa.gov/docs/code/521A.pdf), insurance holding company systems: registration, the 10% control presumption, the extraordinary dividend test and 30-day clock in 521A.5, the enterprise risk report and section 521A.14 on mutual insurance holding companies
- [Iowa Code chapter 508B (PDF)](https://www.legis.iowa.gov/docs/code/508B.pdf), conversion of a mutual life company to stock: the closed block, consideration equal to statutory surplus, fair allocation and the two-thirds vote
- [Tex. Ins. Code 941.001](https://texas.public.law/statutes/tex._ins._code_section_941.001), definitions of a Lloyd's plan, underwriter and attorney in fact
- [8 V.S.A. 6001](https://legislature.vermont.gov/statutes/section/08/141/06001), Vermont's definitions of pure, association, industrial insured and agency captives and risk retention groups

**NAIC**

- [NAIC: Risk Retention Groups](https://content.naic.org/insurance-topics/risk-retention-groups), RRGs owned by their insureds, the 1981 and 1986 acts, domiciliary oversight, accreditation, no rate and form filing, no guaranty funds (updated October 13, 2025)
- [NAIC: Protected Cell Company Model Act (PDF)](https://content.naic.org/sites/default/files/model-law-290.pdf), the definition of a protected cell and the securitization purpose, adopted 1999
- [NAIC: Managing General Agents Act (PDF)](https://content.naic.org/sites/default/files/model-law-225.pdf), the reciprocal attorney-in-fact excluded from the MGA definition
- [NAIC: 2025 Annual Property and Casualty and Title Insurance Industries Analysis Report (PDF)](https://content.naic.org/sites/default/files/2025-annual-property-and-casualty-and-title-insurance-industries-analysis-report.pdf), intercompany pooling as 58.9% of reinsured business and $5.7 billion of policyholder dividends in 2025
- [NAIC: 2025 Life and Fraternal Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-life-fraternal-market-share.pdf), fraternals reported with life insurers

**Filings**

- [Erie Indemnity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/922621/000162828026010666/erie-20251231.htm), the Exchange as a reciprocal with no employees, the subscriber's agreement, the 25% management fee, premiums written, surplus, fee revenue and net income
- [Root: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000014/root-20251231.htm), the Texas county mutual fronting arrangement
- [Lemonade: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1691421/000169142126000016/lmnd-20251231.htm), Lemonade Re SPC in Cayman and a Bermuda captive cell

**In practice**

- [Lloyd's: How the market works](https://www.lloyds.com/about-lloyds/our-market/lloyds-market), members, syndicates and managing agents, and counts at December 31, 2025
- [Lloyd's: Our market](https://www.lloyds.com/about-lloyds/our-market), more than 400 brokers and more than 3,000 coverholders
- [Lloyd's: Capital structure](https://www.lloyds.com/about-lloyds/investor-relations/capital-structure), the three links of the Chain of Security at December 31, 2025
- [Lloyd's: Full year results 2025](https://www.lloyds.com/about-lloyds/investor-relations/financial-results/full-year-results-2025), gross written premium and combined ratio
- [Northwestern Mutual: Record $10.4 billion expected dividend payout for 2027](https://news.northwesternmutual.com/2026-10-27-Northwestern-Mutual-Announces-Record-10-4-Billion-Expected-Dividend-Payout-for-2027,-the-Largest-in-Company-History), mutual ownership, dividends not guaranteed, the split by product
- [Vermont Captive Insurance](https://www.vermontcaptive.com/), over 1,400 captives licensed to date
