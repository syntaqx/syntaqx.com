+++
title = "The State System"
description = "How US insurance is regulated: McCarran-Ferguson, commissioners, the NAIC and accreditation, model law adoption, FIO and covered agreements, and federal law."
category = "Insurance Industry"
order = 2706
part = "Regulation and Solvency"
tags = ["insurance", "regulation", "naic", "mccarran-ferguson", "federal-insurance-office", "compliance"]
+++

Insurance is the one large financial industry in the United States with no federal charter and no federal prudential regulator. A bank can choose a national charter and answer to the OCC; a broker-dealer registers with the SEC and FINRA wherever it operates. An insurer is licensed by the state where it is domiciled, which examines its books and sets its capital rules, and then by every other state where it sells, each of which approves or polices its rates, forms, agents, claim handling and marketing for the risks located there. Fifty-six jurisdictions do this (the 50 states, the District of Columbia and five territories), coordinated through the National Association of Insurance Commissioners, a standard-setting body with no power of its own over any company. Federal law reaches in only where Congress has said so specifically, or through laws that govern everyone (credit reports, telemarketing, sanctions, employee benefit plans).

For a system that means the jurisdiction is a dimension of nearly every rule. A cancellation notice period, a claim deadline, a rating factor, a data breach clock and a premium tax rate are each a value per state, sometimes per line within a state, each with its own citation and effective date, and the same NAIC model law can be adopted in one state as written, in another with changes, and not at all in a third. This chapter covers where the authority comes from, who exercises it, how the NAIC's models become state law, the federal pieces (the Federal Insurance Office, covered agreements, the statutes that apply to insurers anyway), and how to keep the per-jurisdiction rulebook as data. The rules themselves are in the chapters that follow: [Filing Rates & Forms](/books/insurance/rate-and-form-filing), [Market Conduct & Unfair Practices](/books/insurance/market-conduct), [Data, AI & Privacy Rules](/books/insurance/data-ai-and-privacy-rules), [Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting), [Solvency & Capital](/books/insurance/solvency-and-capital), [When Insurers Fail](/books/insurance/when-insurers-fail) and [Stressed & Residual Markets](/books/insurance/stressed-markets).

## How the Platforms Do It

Carriers describe the state system the same way in their annual reports, because it shapes their whole operation. As of the 10-Ks for fiscal 2025 (filed early 2026):

| Company | What its 10-K says about state regulation |
| --- | --- |
| **Progressive** | Insurance subsidiaries are regulated by the states where they're domiciled and do business; regulated areas include licensing, rates, forms, claims, statutory accounting, reserves, investments, dividends and "limitations on rates of return or excess profitability"; rate regulation "varies from 'use and file,' to 'file and use,' to 'prior approval'"; insurers can be assessed for guaranty funds; holding company laws "impose prior approval requirements for certain transactions between insurers and their affiliates" |
| **Travelers** | "Approximately one-half of the states require prior approval of most rate changes"; about 1,100 P&C groups and 2,600 companies operate in the US |
| **Lemonade** | Licensed in 50 states and DC, operating in 41 plus DC, with a carrier, an agency, a Cayman reinsurer and a Bermuda captive cell, each a separately regulated entity |
| **Erie** | The Exchange is a Pennsylvania-domiciled reciprocal, with its statutory surplus stated "under statutory accounting"; the management fee its attorney-in-fact charges is capped at 25% of premiums written |

The pattern under every one of them: one legal entity per license, a domiciliary regulator that owns solvency, and a set of non-domiciliary regulators that each own market rules for their state. Core platforms model the same split: products, forms and rates are configured per state and line, and a jurisdiction table drives the variations (the vendor configurations are in [Products, Coverages & Forms](/books/insurance/products-and-coverages) and [Core Platforms](/books/insurance/core-platforms)).

## Where the Authority Comes From

Until 1944, insurance wasn't considered interstate commerce at all. In *Paul v. Virginia* (1869) the Supreme Court held that "issuing a policy of insurance is not a transaction of commerce," and for 75 years that kept Congress out. *United States v. South-Eastern Underwriters Association*, decided June 5, 1944, reversed course: fire insurers fixing rates across state lines were engaged in interstate commerce, and the Sherman Act applied to them. Congress answered within a year with the **McCarran-Ferguson Act** (March 9, 1945, now 15 U.S.C. 1011-1015), which returned the field to the states on two terms:

- **States regulate and tax.** "The business of insurance, and every person engaged therein, shall be subject to the laws of the several States" relating to its regulation or taxation (section 1012(a)).
- **Federal law yields unless it says otherwise.** "No Act of Congress shall be construed to invalidate, impair, or supersede any law enacted by any State for the purpose of regulating the business of insurance ... unless such Act specifically relates to the business of insurance" (section 1012(b)). This is reverse preemption: a general federal statute that conflicts with a state insurance law loses.
- **Antitrust applies only where states don't regulate.** After June 30, 1948, the Sherman, Clayton and FTC Acts apply "to the extent that such business is not regulated by State Law." That proviso is why advisory organizations can publish loss costs and forms that competitors share, under state supervision ([Filing Rates & Forms](/books/insurance/rate-and-form-filing) has the mechanics).

Everything since has been built on that base: state codes that license insurers, agents and adjusters; state rate and form laws; state claim practices acts; state capital, investment and receivership laws; and federal laws that "specifically relate" to insurance only in narrow places (risk retention groups, surplus lines, terrorism, flood, crop, the Federal Insurance Office).

## The Commissioner and the Department

Each jurisdiction has a chief insurance regulator, a commissioner in most states, a superintendent in New York (at the Department of Financial Services), a director in a few. In most states the governor appoints; in some, including California, the commissioner is elected. The department's work splits the way the rest of this part does:

- **Licensing:** certificates of authority for insurers (per line), licenses for producers, adjusters, public adjusters, premium finance companies, service contract providers and others.
- **Product regulation:** rate and form filings ([Filing Rates & Forms](/books/insurance/rate-and-form-filing)).
- **Market regulation:** complaints, market analysis, market conduct exams and enforcement ([Market Conduct & Unfair Practices](/books/insurance/market-conduct)).
- **Financial regulation:** annual and quarterly statements, financial analysis, financial exams, risk-based capital and holding company oversight, for domestic insurers ([Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting), [Solvency & Capital](/books/insurance/solvency-and-capital)).
- **Receivership:** supervision, rehabilitation and liquidation of domestic insurers, usually through a court and often a special deputy or a separate receivership office ([When Insurers Fail](/books/insurance/when-insurers-fail)).
- **Consumer services, fraud and taxes:** the complaint line, a fraud bureau, and premium tax collection (often with the state revenue department).

Two roles matter for every system decision. The **domiciliary state** is where the insurer is incorporated: it alone licenses the company's existence, examines its finances, approves its holding company transactions and dividends, and would liquidate it. Every other state where the insurer holds a certificate of authority is a **non-domiciliary** (foreign) state: it relies on the domiciliary regulator for solvency (if that regulator is accredited, below), but applies its own rates, forms, claim rules, agent licensing and taxes to business written there. A company's choice of domicile is therefore a choice of capital and governance regulator, and carriers redomesticate for that reason. "Alien" insurers are those domiciled outside the US; they write US business through a US subsidiary, a US branch with trusteed assets, as surplus lines insurers, or as reinsurers.

## The NAIC

The NAIC was founded in 1871 and describes itself as a standard-setting organization governed by the chief insurance regulators of the 50 states, DC and five territories. It has no regulatory authority: it can't license, examine or fine anyone. Its power is that regulators act through it collectively, in committees, task forces and working groups, and that what it produces becomes binding when states adopt it. What it produces:

- **Model laws, model regulations and guidelines.** Draft statutes and rules that states may enact, numbered (Model #312 is risk-based capital, #440 the holding company act, #880 unfair trade practices, #668 data security). Many carry a project history explaining why the model was written.
- **The annual statement blanks and instructions, and the Accounting Practices and Procedures Manual.** Every insurer's financial statements follow them because state law adopts them by reference ([Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting)).
- **Formulas and handbooks:** the risk-based capital formulas, the financial analysis and examiners handbooks, the market regulation and market analysis handbooks.
- **Shared infrastructure:** the financial data repository built from statutory filings, the ratio systems run on it (IRIS and FAST, in [Solvency & Capital](/books/insurance/solvency-and-capital)), SERFF for rate and form filings, the market conduct annual statement, and the producer database used for licensing.
- **Bulletins in model form.** A model bulletin (the AI bulletin of December 4, 2023 is the best-known) is guidance a commissioner issues without a legislature, enforceable only through the department's existing statutory powers.

### How a Model Becomes Law

A model does nothing until a jurisdiction acts. The NAIC tracks each model's progress on a **state page** per model and, for some, an adoption map, and sorts every jurisdiction into four buckets defined on each state page:

- **Model adoption:** the state adopted the most recent version "in a substantially similar manner" (the whole model, variations in style allowed; partial adoption appears here with a note).
- **Previous version:** the state enacted an older version of the model but not the current one.
- **Related activity:** statutes, regulations or bulletins on the same subject that are not the model.
- **No current activity:** nothing, including repealed laws.

The NAIC's disclaimer on each page is that it "does not constitute a formal legal opinion" and that readers should consult state law. Two examples show the spread. The AI Model Bulletin, as of the NAIC's November 3, 2026 status map, had been adopted in 29 jurisdictions (27 states, the District of Columbia and Puerto Rico), with California, Colorado, New York and Texas listed separately for their own insurance-specific rules. The Insurance Data Security Model Law (#668), adopted by the NAIC in the fourth quarter of 2017, is in the "model adoption" column for roughly half the states by my reading of the NAIC's Summer 2026 state page, while New York regulates the same ground with its own cybersecurity regulation (23 NYCRR 500) and others with general breach laws. Both are covered in [Data, AI & Privacy Rules](/books/insurance/data-ai-and-privacy-rules).

The working rule for a system: never encode "the NAIC model" as if it were law. Encode each jurisdiction's citation, with its own effective date and the version of the model it follows, and treat the model as a template for the shape of the rule.

### Accreditation

Accreditation is how states trust each other's solvency regulation. Under the NAIC's Financial Regulation Standards and Accreditation Program, an accredited state's financial regulation of its domestic insurers is accepted by the others, so a Texas regulator doesn't re-examine an Ohio-domiciled company. The standards come in four parts:

| Part | What it requires |
| --- | --- |
| **A: Laws and regulations** | The state has enacted the laws that matter for solvency in substantially similar form, including the holding company, liabilities and reserves, credit for reinsurance and CPA audit standards |
| **B: Regulatory practices** | Financial analysis (B1, including ORSA review), financial examinations (B2, including actuarial specialists) and troubled company procedures (B3) |
| **C: Organization and personnel** | Enough qualified staff, paid enough (salary ranges are reviewed) |
| **D: Licensing and change of control** | Primary licensing, redomestication and change of control reviews, which can affect accreditation since 2022 |

The NAIC's Financial Regulation Standards and Accreditation Committee conducts "a yearly review of accredited jurisdictions," and new standards take effect on dates the committee sets, giving legislatures time to act. Recent ones, from the committee's page as of November 2026: the group capital calculation and liquidity stress test from the 2020 revisions to the holding company models (#440 and #450), effective January 1, 2026; the 2019 revisions to the credit for reinsurance models (#785 and #786) and the XXX/AXXX reserve financing model (#787), effective September 1, 2022 with enforcement from January 1, 2023; internal audit requirements from the 2014 revisions to the Annual Financial Reporting Model Regulation (#205) and the corporate governance models (#305 and #306), effective January 1, 2020. Accreditation is why a law that looks optional (a model) is close to mandatory in practice: a state that won't enact it risks the standing that lets its insurers do business elsewhere without duplicate oversight.

## The Federal Pieces

### The Federal Insurance Office

Title V of the Dodd-Frank Act (2010) created the Federal Insurance Office inside Treasury (31 U.S.C. 313). It monitors the industry, "including identifying issues or gaps in the regulation of insurers that could contribute to a systemic crisis," administers the Terrorism Risk Insurance Program, coordinates federal policy on international insurance matters and represents the US at the International Association of Insurance Supervisors, and its Director sits on the Financial Stability Oversight Council as a non-voting member. It can collect data from insurers (by subpoena only on a written finding by the Director that the data is required). What it can't do is stated in the statute: nothing in the section gives it "general supervisory or regulatory authority over the business of insurance." Health insurance, long-term care (except as part of life or annuity products) and crop insurance are outside its scope.

FIO's September 2026 annual report counted $2.2 trillion of US direct premium for 2025 and noted, among its other work, the 2026 Terrorism Risk Insurance Program aggregate retention of $58.67 billion, its monitoring of state adoption of the NAIC AI bulletin, the re-established Federal Advisory Committee on Insurance (March 2026), and Treasury meetings with state commissioners on life insurers' use of private credit and offshore reinsurance (taken up in [Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital)).

### Covered Agreements

FIO's one preemptive power runs through **covered agreements**: bilateral or multilateral agreements on prudential measures, negotiated by Treasury and the US Trade Representative with foreign governments or regulators, that give consumer protection "substantially equivalent" to state regulation. A state insurance measure is preempted only if, and to the extent, the Director determines that it treats a non-US insurer domiciled in the other jurisdiction less favorably than a US insurer and is inconsistent with the agreement, after consulting the state, publishing notice and waiting at least 30 days.

Two are in force: the US-EU covered agreement (entered into force April 4, 2018) and the US-UK covered agreement (December 31, 2020). Their main effect was on reinsurance: EU and UK reinsurers meeting capital and solvency conditions no longer have to post collateral for a US ceding insurer to take credit for the reinsurance. The states implemented it themselves rather than wait for preemption: the 2019 revisions to the NAIC's Credit for Reinsurance Model Law (#785) define a "Reciprocal Jurisdiction" as a non-US jurisdiction subject to an in-force covered agreement (or, for the EU agreement, an EU member state), an accredited US jurisdiction, or a qualified jurisdiction the commissioner recognizes on the same terms, and those revisions became an accreditation standard from September 1, 2022. FIO's 2025 preemption report recorded no preemption action. [Reinsurance Operations](/books/insurance/reinsurance-operations) covers credit for reinsurance in full.

### Federal Laws That Name Insurance

Where Congress has "specifically related" a law to insurance, it overrides the states, usually narrowly:

- **Risk retention groups.** The Liability Risk Retention Act (1981, amended 1986, 15 U.S.C. 3901 ff.) lets a group chartered in one state write liability coverage for its members everywhere, exempt from most other states' laws; non-chartering states keep unfair claims practices, premium taxes, registration and a required notice that guaranty funds don't apply ([Who Carries the Risk](/books/insurance/who-carries-the-risk) covers the form).
- **Surplus lines.** The Nonadmitted and Reinsurance Reform Act (Dodd-Frank Title V, Subtitle B) makes the insured's home state the only regulator of a surplus lines placement: placement is "subject to the statutory and regulatory requirements solely of the insured's home State," and "No State other than an insured's home State may require a surplus lines broker to be licensed" for it (15 U.S.C. 8202). [Excess & Surplus Lines](/books/insurance/excess-and-surplus-lines) has the rest.
- **Federal programs.** The National Flood Insurance Program, the Federal Crop Insurance Corporation and the Terrorism Risk Insurance Program are federal insurance or reinsurance programs run alongside private carriers ([Flood & the NFIP](/books/insurance/flood-and-the-nfip), [Crop Insurance](/books/insurance/crop-insurance), [Cat Bonds, ILS & State Cat Funds](/books/insurance/alternative-capital)).

### Federal Laws That Apply to Insurers Anyway

The rest of federal law applies to insurers the way it applies to any company, and several pieces shape insurance systems directly:

- **FCRA.** A consumer reporting agency may furnish a report to a person who "intends to use the information in connection with the underwriting of insurance involving the consumer" (15 U.S.C. 1681b(a)(3)(C)), and adverse action notices follow when a report drives a worse outcome. [Consumer Reports & Third-Party Data](/books/insurance/consumer-reports-and-third-party-data) owns it.
- **GLBA privacy.** Title V of Gramm-Leach-Bliley covers insurers as financial institutions, but enforcement against "any person engaged in providing insurance" belongs to "the applicable State insurance authority of the State in which the person is domiciled" (15 U.S.C. 6805(a)(6)). States implement it through the NAIC privacy model (#672) and their own laws ([Data, AI & Privacy Rules](/books/insurance/data-ai-and-privacy-rules#privacy-glba-and-model-672)).
- **TCPA.** Autodialed and prerecorded calls and texts to cell phones need prior express consent, with $500 per violation in statutory damages, trebled when willful (47 U.S.C. 227). Insurance lead generation is one of its most litigated areas; the general rules are in [Consumer Contact](/docs/compliance/consumer-contact#tcpa-consent) and the insurance side in [Leads, Aggregators & Consent](/books/insurance/leads-and-consent).
- **OFAC sanctions.** Insurers may not pay claims, refunds or commissions to blocked persons; blocked property must be reported within 10 business days, and an annual report of property blocked as of June 30 is due by September 30 (31 CFR 501.603). Screening sits at policy issuance and at every payment ([Exposures, Reserves & Payments](/books/insurance/reserves-and-payments)).
- **ERISA.** ERISA preempts state laws that "relate to any employee benefit plan," saves "any law of any State which regulates insurance," and then says a self-funded plan shall not "be deemed to be an insurance company or other insurer" (29 U.S.C. 1144(a), (b)(2)(A), (b)(2)(B)). The result: insured group life and disability plans are subject to state insurance law, self-funded plans largely aren't. [Group Life & Disability](/books/insurance/group-life-and-disability) and the [Health Tech volume's payer chapter](/books/health-tech/payers-and-plans#the-kinds-of-payer) apply it.

## The Rulebook as Data

What the state system demands of software is a rulebook keyed by jurisdiction, line and date, with a citation on every row. The rules come in a few recurring shapes:

| Shape | Examples | Keyed by |
| --- | --- | --- |
| **A number** | Notice days for nonpayment cancellation; days to acknowledge a claim; premium tax rate; guaranty fund cap | Jurisdiction, line, reason or claim type, effective date |
| **An allowed or banned input** | Credit-based insurance scores in auto rating; gender; prior insurance | Jurisdiction, line, use (rating, underwriting, renewal), effective date |
| **A required document** | Adverse action notice; state amendatory endorsement; privacy notice; disclosure that guaranty funds don't apply | Jurisdiction, line, event |
| **A filing obligation** | Rate filing regime; annual statement; data security certification; AI governance documentation | Jurisdiction, line or entity, period |
| **A clock on the regulator** | Deemer periods (Florida's 90 days, California's 60 and 180), exam report timelines | Jurisdiction, filing type |

Three properties separate a usable rulebook from a pile of constants. **Effective dating with the triggering event named:** some rules apply to policies issued after a date (Florida's assignment-of-benefits ban applies by policy issue date), others to losses after a date, others to notices mailed after a date, and the rule row has to say which event it keys on. **Provenance:** a citation, a source URL, and when someone last checked it, because a status stated from memory is how a system ends up enforcing a repealed rule. **Separation of model and law:** the NAIC model is a reference on the row, never the authority. The general pattern is in [Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions); the insurance specifics are that the jurisdiction dimension is never optional and that the "same" rule across states is usually not the same.

## How to Build It

The core model's `insurers` and `insurer_authorities` (in [The Core Data Model](/books/insurance/insurance-business#the-core-data-model)) record where each insurer is licensed. This chapter adds the jurisdictions themselves, their regulators and accreditation, the adoption status of each NAIC model per jurisdiction, and the per-jurisdiction rules the rest of the volume reads:

```sql
CREATE TABLE jurisdictions (               -- the 56 NAIC members, plus federal
  code               TEXT PRIMARY KEY,      -- 'US-TX', 'US-DC', 'US-PR', 'US-FED'
  name               TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('state', 'district', 'territory',
                       'federal')),
  regulator_name     TEXT,                  -- 'Texas Department of Insurance'
  regulator_title    TEXT,                  -- 'commissioner', 'superintendent', 'director'
  regulator_elected  BOOLEAN,
  accredited         BOOLEAN,               -- NAIC accreditation, as last checked
  accreditation_checked_on DATE
);

ALTER TABLE insurers
  ADD COLUMN domicile_jurisdiction TEXT REFERENCES jurisdictions (code);

CREATE TABLE model_adoptions (             -- one model, one jurisdiction, one status
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  model_number       TEXT NOT NULL,         -- '668', '880', 'AI-BULLETIN-2023'
  jurisdiction       TEXT NOT NULL REFERENCES jurisdictions (code),
  status             TEXT NOT NULL CHECK (status IN ('model_adoption', 'previous_version',
                       'related_activity', 'no_current_activity', 'pending')),
  citation           TEXT,                  -- 'Ill. 215 ILCS 215/1 to 215/999'
  enacted_on         DATE,
  effective_on       DATE,
  partial            BOOLEAN NOT NULL DEFAULT FALSE,
  source_url         TEXT NOT NULL,         -- the NAIC state page or the statute
  checked_on         DATE NOT NULL,         -- when someone last confirmed it
  superseded_by      UUID REFERENCES model_adoptions (id)
);

CREATE TABLE jurisdiction_rules (          -- the rulebook every chapter reads
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction       TEXT NOT NULL REFERENCES jurisdictions (code),
  rule_key           TEXT NOT NULL,         -- 'cancel_notice_days', 'claim_ack_days',
                                            -- 'premium_tax_rate', 'credit_score_allowed'
  line               TEXT,                  -- null when the rule spans lines
  qualifier          JSONB NOT NULL DEFAULT '{}',  -- {"reason": "nonpayment"}
  value              JSONB NOT NULL,        -- 10, 0.0175, false, {"days": 15, "business": true}
  keyed_on           TEXT NOT NULL CHECK (keyed_on IN ('policy_effective', 'policy_issued',
                       'loss_date', 'notice_date', 'filing_date', 'transaction_date')),
  effective          DATERANGE NOT NULL,
  citation           TEXT NOT NULL,         -- 'Fla. Stat. 627.728(3)(a)'
  model_adoption_id  UUID REFERENCES model_adoptions (id),
  source_url         TEXT NOT NULL,
  checked_on         DATE NOT NULL,
  EXCLUDE USING gist (jurisdiction WITH =, rule_key WITH =,
    (COALESCE(line, '')) WITH =, qualifier WITH =, effective WITH &&)
);
```

Notes on the sketch:

- **`keyed_on` is the column most systems leave out.** A rule's effective range means nothing until you know which date it is compared to. Florida's claim rules, for example, have changed for policies issued after one date and for losses after another; a lookup asks for the rule as of the right event.
- **`checked_on` is a work queue.** Rules not checked within a set period (I use 90 days for statutes in active sessions, a year otherwise) go to someone to re-verify against a primary source, and a change becomes a new row with a new range, never an edit.
- **Every decision records the rule row it used** (the `rule_ref` on `claim_tasks` in the core model is an instance), so a decision can be explained by the citation that applied on the day it was made ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Federal rules are a jurisdiction.** OFAC, TCPA and FCRA rules sit under `US-FED` and apply alongside the state row, never instead of it.

## Auditing

- **Which rule applied, as of when.** For any notice, deadline, rating input or filing, the jurisdiction rule row and its citation, and that row's own history, so "was this the law on that date" is a query.
- **When each rule was last verified and by whom,** with the source opened, because a regulator or court will ask why the system believed a superseded rule.
- **Where each insurer was authorized,** by line and date, against every policy written: a policy written in a state where the insurer had no certificate of authority for the line is a violation in itself, and a surplus lines placement needs its eligibility instead.
- **Model adoption history** per jurisdiction, so a compliance program can show it tracked a model's adoption state by state.

## What This Means for the System You Build

- **Make jurisdiction a key on every rule,** with line, qualifier, effective range and the event the range is compared to.
- **Store a citation and a checked date on every rule row,** and run a re-verification queue; never state a status from memory.
- **Treat NAIC models as references, not law;** encode each state's enactment, version and effective date separately.
- **Know the domiciliary state of every insurer entity,** because it decides solvency regulation, dividends, holding company approvals and receivership.
- **Keep federal rules (OFAC, TCPA, FCRA, GLBA as states enforce it) as their own jurisdiction** that applies alongside the state's.
- **Record the rule row behind every decision,** so any notice, deadline or rating input can be defended with the law that applied that day.

## References

**Law and regulation**

- [15 USC 1012](https://www.law.cornell.edu/uscode/text/15/1012), the McCarran-Ferguson Act: insurance subject to state law, reverse preemption unless an Act specifically relates to insurance, antitrust laws applicable after June 30, 1948 only where states don't regulate
- [31 USC 313](https://www.law.cornell.edu/uscode/text/31/313), the Federal Insurance Office's functions, data collection, covered agreement preemption conditions, exclusions, and the denial of general supervisory authority
- [15 USC 8202](https://www.law.cornell.edu/uscode/text/15/8202), the NRRA's home-state rule for nonadmitted insurance and surplus lines broker licensing
- [15 USC 3902](https://www.law.cornell.edu/uscode/text/15/3902), the Liability Risk Retention Act's exemptions and their exceptions
- [15 USC 1681b](https://www.law.cornell.edu/uscode/text/15/1681b), the FCRA permissible purpose for insurance underwriting
- [15 USC 6805](https://www.law.cornell.edu/uscode/text/15/6805), GLBA privacy enforcement by the state insurance authority of the domiciliary state
- [47 USC 227](https://www.law.cornell.edu/uscode/text/47/227), the TCPA consent requirement and $500 statutory damages, trebled when willful
- [31 CFR 501.603](https://www.law.cornell.edu/cfr/text/31/501.603), OFAC blocked property reports within 10 business days and the annual report due September 30
- [29 USC 1144](https://www.law.cornell.edu/uscode/text/29/1144), ERISA preemption, the insurance savings clause and the deemer clause

**Courts**

- [United States v. South-Eastern Underwriters Association, 322 U.S. 533 (1944)](https://www.law.cornell.edu/supremecourt/text/322/533), insurance as interstate commerce subject to the Sherman Act, and the Court's treatment of Paul v. Virginia

**NAIC**

- [NAIC: About](https://content.naic.org/about), founded 1871, governed by the chief regulators of the 50 states, DC and five territories
- [NAIC: Model laws](https://content.naic.org/model-laws), the model laws, regulations and guidelines and their state action pages
- [NAIC: Financial Regulation Standards and Accreditation Committee](https://content.naic.org/cmte_f.htm), the Part A to D standards, the yearly review, and the effective dates of the GCC and LST, #785/#786/#787, #205 and corporate governance standards
- [NAIC: Implementation of the AI Model Bulletin, status as of November 3, 2026 (PDF)](https://content.naic.org/sites/default/files/legal-adoption-map-ai-model-bulletin.pdf), the 29 adopting jurisdictions and the separate California, Colorado, New York and Texas rules
- [NAIC: Insurance Data Security Model Law state page, Summer 2026 (PDF)](https://content.naic.org/sites/default/files/model-law-state-page-668.pdf), the state page key (model adoption, previous version, related activity, no current activity) and the adoption citations
- [NAIC: Insurance Data Security Model Law (#668, PDF)](https://content.naic.org/sites/default/files/model-law-668.pdf), adopted in the fourth quarter of 2017
- [NAIC: Credit for Reinsurance Model Law (#785, PDF)](https://content.naic.org/sites/default/files/model-law-785.pdf), the Reciprocal Jurisdiction definition tied to in-force covered agreements

**Regulators and guidance**

- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), US premium, the 2026 TRIP aggregate retention, FIO's role, AI bulletin monitoring, the advisory committee and the life sector meetings
- [US Treasury: Covered agreements](https://home.treasury.gov/policy-issues/financial-markets-financial-institutions-and-fiscal-service/federal-insurance-office/covered-agreements), the US-EU and US-UK agreements and their entry into force

**Filings**

- [Progressive: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231.htm), regulated areas, rate regimes, guaranty fund assessments and holding company prior approval requirements
- [Travelers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/86312/000008631226000065/trv-20251231.htm), about half the states requiring prior approval of most rate changes
- [Lemonade: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1691421/000169142126000016/lmnd-20251231.htm), licensed in 50 states and DC, operating in 41 plus DC, and its regulated entities
- [Erie Indemnity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/922621/000162828026010666/erie-20251231.htm), the Pennsylvania-domiciled reciprocal, statutory surplus and the 25% fee cap
