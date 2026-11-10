+++
title = "The Insurance Business"
description = "How insurance works: carriers, agents, MGAs and reinsurers, where the premium dollar goes, the life of a policy, a claim and a life policy, and the data model."
category = "Insurance Industry"
order = 2701
part = "The Business"
tags = ["insurance", "property-and-casualty", "life-insurance", "business-models", "data-model"]
+++

Insurance is a promise priced before anyone knows what it will cost. A homeowner pays a premium today for a promise that, if a hurricane takes the roof next September, someone will pay to replace it; a driver pays for six months of liability coverage that will cost the insurer nothing in most policies and six figures in a few; a forty-year-old pays twenty years of level premiums for a death benefit their family hopes never to collect. The insurer collects the premium up front, earns it day by day as the promise runs, sets money aside for claims it knows about and for claims that have happened but haven't been reported yet, invests the money in between, and finds out years later whether the price was right. Everything distinctive about the industry follows from that order of events: the product is a contract, the cost of goods sold is an estimate that keeps changing, and the regulator's main job is making sure the company will still be there to pay.

The software is hard because one promise is recorded many ways at once and every record has a date it is true as of. A policy has an effective date and a date it was processed, and an endorsement processed in June can change what was covered in March. Premium is written on one day, earned over months, billed in installments, commissioned to an agent, ceded in part to a reinsurer and taxed by the state the risk sits in. A claim has a loss date, a reported date, reserves that move every time an adjuster learns something, payments to people who aren't the policyholder, and recoveries that arrive years after it closed. Fifty-six jurisdictions regulate the rates, the forms, the notices, the claim deadlines and the capital behind all of it, each in its own way. This chapter is the map the rest of the volume uses: how to read it, the parties, where the premium dollar goes, the life of an auto policy, a property claim and a term life policy, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/insurance/glossary).

## How to Read This Volume

The volume follows a promise from the license that lets an insurer make it, through the agent who sells it, the rate that prices it, the system that issues and changes it, the claim that tests it and the capital that backs it, in thirteen parts plus a reference:

- **The Business.** This chapter; The Insurance Landscape (the market in numbers from NAIC data, carriers by line, brokers by revenue, the insurtechs and what their filings say, core vendors, consolidation); How Insurers Make Money (written, earned and unearned premium worked through, the loss, expense and combined ratios, investment income and float, surplus and leverage, the underwriting cycle); Who Carries the Risk (stock, mutual, reciprocal, fraternal, Lloyd's, captives and risk retention groups); and MGAs, Programs & Fronting (delegated authority, program administrators, fronting and hybrid fronting carriers, capacity, the bordereau).
- **Regulation and Solvency.** The State System (McCarran-Ferguson, commissioners, the NAIC and accreditation, model laws, the Federal Insurance Office); Filing Rates & Forms (prior approval, file-and-use and use-and-file, SERFF, actuarial memoranda, objections, advisory loss costs); Market Conduct & Unfair Practices (exams, the market conduct annual statement, unfair trade practices, complaints); Data, AI & Privacy Rules (the NAIC AI bulletin, Colorado's law, the data security model law, privacy, credit-based insurance scores); Statutory Accounting & the Annual Statement (SAP versus GAAP, admitted assets, the blanks and schedules); Solvency & Capital (risk-based capital, IRIS ratios, ORSA, holding company rules, rating agencies); When Insurers Fail (rehabilitation, liquidation and the guaranty associations); and Stressed & Residual Markets (Florida, California, FAIR plans and residual auto plans).
- **Distribution.** Agents, Brokers & Channels (captive, independent, direct, wholesale and surplus lines); Producer Licensing & Appointments (lines of authority, NIPR, the NPN, appointments and terminations); Commissions & Agency Accounting (schedules, contingent commissions, agency bill and direct bill, fiduciary funds); Comparative Raters & Agency Systems (raters, bridging, downloads, agency management systems); and Leads, Aggregators & Consent (lead markets and TCPA consent after the one-to-one rule's vacatur).
- **Rating and Underwriting.** How a Rate Is Built (the filed rating algorithm, base rates, factor tables, territories, loss costs, a worked premium); What You May Rate On (factors states ban or limit, price optimization, unfair discrimination testing); Consumer Reports & Third-Party Data (MVRs, loss history, prefill, insurance scores, FCRA and adverse action); Telematics & Usage-Based Insurance; and Underwriting Rules, Referrals & Models (eligibility, authority, referrals, inspections, model governance).
- **Policy Administration.** Products, Coverages & Forms (the product model, ISO forms, state amendatory endorsements); Quote, Bind & Issue (binders, declarations, effective times, e-delivery, proof of insurance); Endorsements, Renewals & the Policy Transaction Model (midterm changes, out-of-sequence endorsements, rewrites, bitemporal versions); Cancellation, Nonrenewal & Notice Law (notice days by state and reason, return premium, reinstatement); and Billing & Premium Finance (installment plans, nonpay, premium finance companies, refunds).
- **Claims.** First Notice, Coverage & Triage; Claim Handling Law & Clocks (the unfair claims settlement models and state deadlines); Exposures, Reserves & Payments; Auto Claims & Total Loss; Property Claims (estimating, appraisal, public adjusters, assignment of benefits); Subrogation, Salvage & Recovery; Fraud & SIU; and Bad Faith & Litigation.
- **Reserving, Catastrophe and Reinsurance.** Loss Reserving & Development (triangles, IBNR, Schedule P, reading development in 10-Ks); Catastrophe Events; Catastrophe Models & Their Regulators; Reinsurance Structures (quota share, surplus, excess of loss, layers and reinstatements worked through); Reinsurance Operations (cessions, bordereaux, recoverables, credit for reinsurance, renewals); and Cat Bonds, ILS & State Cat Funds.
- **Personal Lines.** Personal Auto (financial responsibility, no-fault, uninsured motorists, rideshare gaps); Homeowners & Renters; Flood & the NFIP; and Pet & Travel Insurance.
- **Commercial and Specialty Lines.** The Commercial Lines Map (BOP, package, general liability, property, auto, umbrella, inland marine); Professional & Management Liability (E&O, D&O, EPLI, claims-made mechanics); Cyber Insurance; Surety Bonds; Certificates of Insurance; Excess & Surplus Lines; and Crop Insurance.
- **Workers' Compensation.** Workers' Compensation (statutory coverage, rating bureaus, state funds, PEOs); Rating Workers' Comp & Premium Audit (class codes, payroll, experience mods, audits, pay-as-you-go); and Workers' Comp Claims (state EDI reporting, fee schedules, return to work).
- **Life and Annuities.** Life Products as Data; Annuities & Riders; Illustrations; Best Interest, Replacements & 1035 Exchanges; Life Underwriting; In-Force Administration; Life Insurance & the Tax Code; Death Claims & Unclaimed Benefits; Life Reserves, Capital & Private Equity; and Group Life & Disability.
- **Embedded Insurance and Service Contracts.** Embedded Insurance (coverage sold inside another product's checkout, licensing, disclosure and revenue share); Service Contracts & Warranties (what is and isn't insurance, the obligor and administrator model, Magnuson-Moss); Vehicle Service Contracts & GAP; and Home Warranties & Product Protection.
- **Running the Platform.** Insurance System Architecture (the policy, billing and claims split, effective dating, the insurance ledger); Core Platforms (Guidewire, Duck Creek, Majesco, Sapiens, Socotra and the life platforms); ACORD & Data Standards; Regulatory & Statistical Reporting (stat plans, data calls, premium and surplus lines taxes); and Replacing a Core System.
- **Reference.** A [Glossary](/books/insurance/glossary) of every term the volume defines, grouped by part.

The volume covers what insurance adds. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Money & Amounts](/docs/money/amounts), [Payment States & Ledgers](/docs/money/payment-states), [Accounting](/docs/money/accounting), [Temporal Data](/docs/database/temporal-data), [Rules as Data](/docs/building-blocks/rules-as-data), [Generated Documents](/docs/building-blocks/generated-documents), [Workflows](/docs/building-blocks/workflows), [Risk Scoring](/docs/building-blocks/risk-scoring), [Events & Async Messaging](/docs/architecture/events) and [Audit Trails](/docs/building-blocks/audit-trails). Other volumes own topics this one leans on. [Property Tech](/books/property-tech/insurance-deposits-and-guarantees) owns renters insurance requirements, verification and force-placed policies from the property's side, and deposit alternatives. [User-Generated Platforms](/books/user-generated-platforms/gig-work-and-worker-law#rideshare-insurance-periods) owns rideshare insurance periods and [damage claims and host guarantees](/books/user-generated-platforms/damage-and-claims) from the platform's side. [Commerce](/books/commerce/online-consumer-protection#warranties) owns selling warranties and protection plans at checkout and [auto F&I](/books/commerce/automotive-retail). [Banking & Lending](/books/banking-and-lending/auto-lending#gap-and-add-on-products) owns GAP as a loan add-on and [deposit insurance](/books/banking-and-lending/deposit-insurance), [Investing & Digital Assets](/books/investing-and-digital-assets/customer-protection) owns SIPC, [Payments](/books/payments/checks) owns the rails premiums and claim payments ride on, and [Hosting & Cloud](/books/hosting-and-cloud/texting-registration) owns texting registration. This volume owns the insurance side of each: the product, how it is filed and priced, who may sell it, and what the insurer owes when a claim arrives.

The volume is US-centric, because US insurance is regulated by the states and their rules are the ones a US system has to encode, with Lloyd's, Bermuda and the EU where they bind US business or teach. No single company is the model: the vocabulary and tables are the industry's, benchmarked across personal lines carriers (Allstate, Erie, GEICO, Lemonade, Progressive, Root, State Farm, Travelers, USAA and others), commercial and specialty carriers (Chubb, The Hartford, Kinsale, Markel, W. R. Berkley and others), life and annuity writers (Athene, Corebridge, MetLife, New York Life, Northwestern Mutual, Prudential and others), brokers (Aon, Arthur J. Gallagher, Brown & Brown, Marsh, WTW), reinsurers (Everest, Munich Re, RenaissanceRe, Swiss Re) and core vendors (Duck Creek, Guidewire, Majesco, Sapiens, Socotra and others), and a company's own product name appears only where the chapter is describing that company.

## Why Health Insurance Isn't Here

Health plans are insurance under state law, and the same departments license them, but the business runs on a different core: members instead of insureds, provider networks and negotiated contracts, claims that arrive as X12 837 transactions from doctors rather than as a notice of loss from the policyholder, medical management, and a federal overlay (the ACA, ERISA, Medicare and Medicaid) that reaches much further into the product than federal law reaches into a homeowners policy. The [Health Tech](/books/health-tech/payers-and-plans) volume owns all of it, from [the kinds of payer and plan design](/books/health-tech/payers-and-plans#the-kinds-of-payer) to [payer operations](/books/health-tech/payer-operations) and [claims](/books/health-tech/claims). This volume links there where a reader would expect health coverage (group benefits, the medical side of workers' compensation) and covers everything else: property and casualty, workers' compensation, life, annuities, disability and the other non-health lines.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Insureds and policyholders** | The people and businesses covered: a named insured who owns the policy, plus drivers, household members, additional insureds, lienholders and mortgagees with an interest in it; for life, an owner, an insured life and beneficiaries who may all be different people | A price they can get, a policy that says what they bought, notice before it ends, and a claim paid on time |
| **Insurers (carriers)** | Companies licensed to bear risk: stock companies owned by shareholders, mutuals owned by policyholders, reciprocal exchanges run by an attorney-in-fact, fraternals, Lloyd's syndicates, captives and risk retention groups. About 1,100 P&C groups and 2,600 companies operate in the US, per Travelers' 2025 10-K | Filed rates and forms they can prove they used, premium recorded and earned correctly, reserves they can defend, and every record a regulator asks for |
| **Agents and brokers (producers)** | Licensed people and agencies who sell insurance: captive agents for one carrier, independent agents appointed by many, brokers who represent the buyer, and direct carriers' own licensed staff | Quotes from many carriers, commissions paid correctly, policy and claim data downloaded into their agency system, and a license and appointment for every sale |
| **Wholesalers and surplus lines brokers** | Brokers who place risks retail agents can't place in the admitted market, often with non-admitted (surplus lines) insurers, filing each placement and paying surplus lines tax | Access to specialty markets, the diligent search and stamping filings each state requires, and tax computed per placement |
| **MGAs and program administrators** | Agencies with delegated authority to underwrite, bind and sometimes settle claims for one or more carriers, usually in a niche | Binding authority encoded as rules, and a bordereau of everything they bound, sent to the carrier on schedule |
| **Fronting carriers** | Licensed, rated insurers that issue policies for an MGA's program and cede most or all of the risk to reinsurers, keeping a fee | Program data and collateral they can monitor, because they stay liable to policyholders if the reinsurers don't pay |
| **Reinsurers and capital providers** | Companies (Munich Re, Swiss Re, RenaissanceRe, Everest and others) and investors (through cat bonds and collateralized reinsurance) that take part of an insurer's risk for part of its premium | Ceded premium and losses calculated per contract, and the exposure data to price the next renewal |
| **Adjusters, TPAs and claims vendors** | Staff and independent adjusters, public adjusters who work for the policyholder, third-party administrators that handle claims for self-insureds and programs, and the estimating, salvage, rental and repair networks around them | A claim file with every exposure, reserve, payment and clock, and assignments they can work |
| **Advisory and statistical organizations** | ISO (Verisk), AAIS, NCCI and the independent workers' compensation bureaus, which publish loss costs, forms and rating rules and collect statistical data | Statistical data reported to their plans, in their codes, on their schedule |
| **Data and platform vendors** | Core system vendors, comparative raters, consumer reporting agencies (MVRs, loss history, insurance scores, MIB for life), cat modelers and estimating platforms | Clean integrations and permissible purpose for every data pull |
| **Regulators** | A commissioner or superintendent in each of the 50 states, DC and five territories, coordinated through the NAIC; the Federal Insurance Office monitors but doesn't regulate | Rates and forms filed and followed, claims handled within the rules, capital above the action levels, and records on request |
| **Guaranty associations and residual markets** | State guaranty associations that pay covered claims when an insurer is liquidated, funded by assessments on the solvent insurers; state-created insurers of last resort (Citizens in Florida, FAIR plans, auto plans) | Policy and claim data handed over cleanly when a company fails, and assessment and participation data from every insurer |

Four splits shape the data model. **Insurer versus seller versus administrator.** The insurer bears the risk and is the only party a policy obligates to pay; an agent, broker, MGA, platform or TPA may quote, bind, bill and adjust in its name, but every policy, premium and claim belongs to exactly one insurer (and, for a fronted program, to the fronting carrier on paper). **Admitted versus non-admitted.** An admitted insurer holds a certificate of authority in the state and files its rates and forms there; a surplus lines insurer is eligible but not licensed, writes on its own rates and forms through a licensed surplus lines broker, and its policyholders have no guaranty fund behind it. The same risk can be written either way, and every downstream rule depends on which. **Effective time versus recorded time.** A policy change has a date it takes effect and a date it was processed, a claim has a loss date and a reported date, and premium has a date it was written and a period it is earned over. Reports, reserves, regulators and courts each ask for a different one. **Written versus earned versus collected.** Premium is written when a transaction is processed, earned as the coverage period passes, billed on the installment plan and collected when it is paid; an insurer can have written a policy it hasn't collected for and collected money it hasn't earned.

## How the Money Works

An insurer earns money two ways: by charging more in premium than it pays in claims and expenses (underwriting profit), and by investing the premium between the day it arrives and the day the claims are paid (investment income on the float). Where the premium dollar goes, and how the industry measures it, is the subject of How Insurers Make Money; the figures below are from NAIC reports and filings, dated, and the worked examples are illustrations, labeled as mine.

### Where the Premium Dollar Goes

A premium is the price of the coverage plus the costs of selling and administering it, and the insurer's own share is what's left after the others:

- **Commission** to the producer, a percentage of written premium, often higher on new business than on renewals, and returned pro rata if the policy cancels (Commissions & Agency Accounting).
- **Premium tax** to the state where the risk is located, paid by the insurer on the premium it writes there, plus surplus lines tax and stamping fees on non-admitted placements, which the surplus lines broker collects: as of the 2025 stamping office figures, California charged a 3.00% surplus lines tax and a 0.18% stamping fee, and Florida 4.94% and 0.06% (WSIA).
- **Fees and assessments**: installment fees, policy fees where a state allows them, and assessments for guaranty associations, residual markets and state funds, some recouped from policyholders as surcharges.
- **Ceded premium** to reinsurers, a share of the premium (quota share) or a price for protection above a retention (excess of loss), with a ceding commission coming back on proportional treaties.
- **Losses and loss adjustment expense (LAE)**: claim payments and reserves, plus the cost of handling claims, split into defense and cost containment (DCC, the legal and expert costs tied to specific claims) and adjusting and other (A&O, the claims department).
- **Underwriting expenses**: acquisition, underwriting, policy administration, technology and overhead.

### Written, Earned and Unearned

A worked example, mine: a six-month personal auto policy written for $900.00, effective 12:01 a.m. on March 1, 2026 and expiring September 1, 2026, a term of 184 days. On March 1 the insurer has written $900.00 and earned nothing; the $900.00 sits in the **unearned premium reserve**, a liability, because if the policy cancelled that morning the insurer would owe almost all of it back. Premium earns pro rata by day by default, so by March 31 (31 days) the insurer has earned 900 × 31 / 184 = $151.63 and still holds $748.37 unearned.

On May 1 (61 days in, 123 days left) the insured adds a second car whose six-month premium is $360.00. The endorsement writes only the remaining share: 360 × 123 / 184 = $240.65 of additional written premium, earned over the 123 days that remain. On July 1, with 62 days left, the insurer cancels for nonpayment. Insurer-initiated cancellations return premium pro rata: 900 × 62 / 184 = $303.26 on the original coverage and 360 × 62 / 184 = $121.30 on the added car, $424.56 in return premium, less whatever the insured still owes. Had the insured asked to cancel, the policy might return less on a short-rate table; Florida, for one, prohibits short-rate tables that return less than 90% of pro rata unearned premium without justification (Fla. Admin. Code 69O-170.010). Every number in this paragraph comes from one record per transaction with an effective date and an amount; the earned and unearned figures are computed from them, never stored as balances someone updates.

### The Ratios

The industry measures underwriting with four ratios. The **loss ratio** is losses incurred over earned premium; the **LAE ratio** is loss adjustment expense over earned premium (the two are often combined); the **expense ratio** is underwriting expenses over written premium; the **combined ratio** is their sum, and below 100% means the insurer made money on underwriting before investment income. NAIC's 2025 results for the US P&C industry, on statutory figures:

| Item | 2025 | 2024 | 2023 |
| --- | --- | --- | --- |
| Net premiums written | $976.8B | $938.7B | $863.4B |
| Net premiums earned | $958.7B | $908.9B | $826.7B |
| Net loss ratio, including LAE | 66.5% | 71.2% | 76.3% |
| Expense ratio | 25.8% | 25.3% | 24.9% |
| Combined ratio | 92.9% | 96.9% | 101.7% |
| Underwriting gain (loss) | $68.7B | $25.3B | ($19.7B) |
| Net investment income earned | $88.9B | $85.3B | $70.3B |
| Net income | $150.6B | $167.2B | $87.3B |
| Policyholders' surplus, December 31 | $1.27T | $1.13T | $1.06T |

In 2023 the industry lost money on underwriting and made it back on investments; in 2025, with lower catastrophe losses, it made money on both. Underwriting results swing with catastrophes, inflation in repair and medical costs, and litigation; investment income is steadier, which is why the float matters. The life industry is a different shape: NAIC reported $1.51 trillion of direct premium and deposits for 2025, of which annuities were $546.4 billion and life insurance $233.5 billion, against $540.7 billion of capital and surplus and nearly $10 trillion of admitted assets, because a life insurer holds reserves for decades.

### Float, Surplus and Leverage

The **float** is the money an insurer holds for others: unearned premium and loss reserves. Progressive held $25.2 billion of unearned premium and $43.3 billion of loss and LAE reserves at the end of 2025 against a $97.4 billion investment portfolio, per its 10-K. **Policyholders' surplus** (statutory capital) is what's left after liabilities on the statutory balance sheet, and it limits how much an insurer can write: Progressive reported $83.2 billion of net premiums written against $28.4 billion of statutory surplus, a premium-to-surplus ratio of 2.9 to 1, and described 3 to 1 as the general regulatory benchmark for P&C insurers. Growth needs capital, which is why reinsurance, fronting and capital from outside investors (Reserving, Catastrophe and Reinsurance) are as much a part of the business as underwriting.

### The Market in One Paragraph

US P&C insurers wrote $1.11 trillion of direct premium in 2025, NAIC's market share data shows, with private passenger auto ($371.0 billion) and homeowners ($188.7 billion) the two largest lines. State Farm (10.4%), Progressive (7.6%), Berkshire Hathaway (5.8%), Allstate (5.4%) and Travelers (3.9%) led, the top ten groups wrote about 51% and the top 25 about 66%. The Federal Insurance Office counted $2.2 trillion of US direct premium across life and P&C for 2025 (excluding deposits and health-only insurers), 44.4% of the world's. The Insurance Landscape breaks the market down by line, group and channel.

## The Life of an Auto Policy

1. **Quote.** A customer asks for a quote on a carrier's site, through an independent agent's comparative rater or from a lead aggregator. The system prefills drivers and vehicles, orders consumer reports (a motor vehicle record, a claims history, an insurance score where the state allows it) under the FCRA's permissible purpose, and runs the rating algorithm the carrier filed for that state and that effective date. The quote stores every input and every step of the calculation, because the filing is the law and a regulator or an adverse action notice may need to show exactly how the price was reached (How a Rate Is Built; Consumer Reports & Third-Party Data).
2. **Bind and issue.** The customer accepts and pays a down payment; the insurer (or an agent with binding authority) binds coverage effective at a stated time, issues the policy with its declarations page and forms, sends ID cards, and reports the policy to the state's insurance verification system where one exists. If an agent sold it, the system checks the agent's license and appointment for that state and line before paying commission (Quote, Bind & Issue; Producer Licensing & Appointments).
3. **Billing.** The policy goes on an installment plan; each installment is an invoice, and a missed one starts a nonpayment process whose notice timing is set by state law (Billing & Premium Finance).
4. **Endorse.** Midterm the insured adds a car, changes an address, or removes a driver. Each change is a policy transaction with its own effective date, writing the pro rata premium difference; a change backdated before a later one already processed is an out-of-sequence endorsement, and the system must replay the later one on top (Endorsements, Renewals & the Policy Transaction Model).
5. **Cancel or renew.** If the insured stops paying, the insurer sends a cancellation notice with the days the state requires; in Florida, at least 10 days for nonpayment and 45 days for other reasons on personal auto (Fla. Stat. 627.728), and in New York, after the first 60 days only for nonpayment, a suspended license or fraud (N.Y. Ins. Law 3425). Otherwise the policy renews on new rates, or the insurer nonrenews with the advance notice and reasons the state requires (Cancellation, Nonrenewal & Notice Law).

Through all of it, the commission is accrued and clawed back pro rata on cancellation, the premium is ceded under whatever quota share the carrier buys, and statistical data for every transaction flows to the stat agent in the plan's codes (Regulatory & Statistical Reporting).

## The Life of a Property Claim

A hurricane makes landfall in Florida and takes part of an insured home's roof.

1. **First notice.** The policyholder reports the loss by phone, app or agent. The system creates a claim against the policy in force on the loss date (not the policy as it is today), records the loss date, the reported date and the cause of loss, and tags it with the catastrophe code for the event so every claim from the storm can be counted, staffed and later recovered from reinsurance together (First Notice, Coverage & Triage; Catastrophe Events).
2. **Clocks start.** Florida requires the insurer to acknowledge claim communications within 7 days, begin investigating within 7 days of proof of loss, inspect within 30 days of it, and pay or deny a residential property claim within 60 days of notice (Fla. Stat. 627.70131). The NAIC's model regulation, which many states follow in some form, sets 21 days to accept or deny a first-party claim after proof of loss and a status letter every 45 days if more time is needed (Model 902). Each deadline becomes a dated task on the claim (Claim Handling Law & Clocks).
3. **Coverage and exposures.** The adjuster confirms the policy covers wind, applies the hurricane deductible, and opens exposures: the dwelling, other structures, contents, and additional living expense, each against a coverage with its own limit. A coverage question becomes a reservation of rights letter, itself a notice with a deadline.
4. **Reserve.** The adjuster sets a case reserve on each exposure, an estimate of what will be paid, and changes it as the inspection and estimate come in. Each change is a new row, never an edit, because the reserve history is what actuaries build loss development triangles from and what Schedule P reports (Exposures, Reserves & Payments; Loss Reserving & Development).
5. **Pay.** Payments go out per exposure and coverage, which the model regulation requires the insurer to identify on each payment, often jointly to the insured and the mortgagee named on the policy, sometimes to a contractor; each payment reduces the reserve.
6. **Recover and close.** The insurer bills its catastrophe excess of loss reinsurers for their share of the event once its losses pass the retention (Reinsurance Operations). On an auto claim, the recovery would instead be subrogation against the at-fault driver's insurer, and salvage from the totaled car (Subrogation, Salvage & Recovery). The claim closes when the last exposure closes, and reopens if the policyholder finds more damage.

If the insurer itself fails before paying, as twelve Florida property insurers in liquidation as of November 2026 did, the open claim passes to the state guaranty association, which pays covered claims up to the statutory limit (When Insurers Fail).

## The Life of a Term Life Policy

1. **Application.** A licensed, appointed agent (or a carrier's direct channel) takes an application for a 20-year level term policy: the owner, the insured, the beneficiaries, the face amount and the answers to medical and lifestyle questions.
2. **Underwriting.** The insurer checks the MIB, the member database of coded findings from earlier individually underwritten applications in the past seven years, orders a prescription history and a motor vehicle record, and may waive exams and fluids for an applicant an accelerated underwriting model clears. Each data source is a consumer report under the FCRA, with authorizations and adverse action duties, and Colorado regulates the governance of the models that use them (Life Underwriting).
3. **Issue and free look.** The policy issues at a rate class (preferred, standard, rated), the owner gets a free look period to return it for a full refund, and the agent's commission is paid on the schedule in the agent's contract, with a chargeback if the policy lapses early (In-Force Administration).
4. **In force.** Premiums bill monthly or annually for twenty years. A missed premium starts a grace period; at its end the policy lapses, and may be reinstated with evidence of insurability. The owner can change beneficiaries or convert to permanent coverage if the contract allows.
5. **Death claim.** If the insured dies, the beneficiary files a claim with a death certificate; within the contestable period the insurer can review the application for material misrepresentation. If no one files, the insurer still has to look: under the NCOIL model unclaimed benefits act, insurers compare in-force policies against the Social Security Death Master File at least semi-annually and, within 90 days of a match, begin locating beneficiaries, with unclaimed proceeds escheating to the state (Death Claims & Unclaimed Benefits).

Group term life sold through an employer follows the same product logic with different plumbing: the employer is the policyholder, employees enroll, and the employer pays the premium on a bill the carrier generates from the census (Group Life & Disability).

## The Core Data Model

Every company in this volume converges on the same concepts under different names: a carrier's named insured, a broker's client and a life company's owner are all parties in a role; an agent, an agency, a broker and an MGA are all producers; a vehicle, a dwelling, a payroll class and an insured life are all risks; a Guidewire job, a Socotra transaction and a legacy system's activity are all policy transactions; a claim's feature, line or exposure is an exposure. The volume uses one set of names, and every later chapter's How to Build It extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **insurer** | `insurers` | A risk-bearing company, with its NAIC company and group codes, domicile and legal form |
| **insurer authority** | `insurer_authorities` | An insurer's certificate of authority or surplus lines eligibility in one state, for named lines, effective-dated |
| **party and party role** | `parties`, `party_roles` | A person or organization, and its role on a policy, claim or account: named insured, additional insured, driver, mortgagee, lienholder, owner, insured life, beneficiary, claimant, vendor, attorney |
| **producer** | `producers` | An agency or an individual agent or broker, with its NPN |
| **producer license and appointment** | `producer_licenses`, `appointments` | A producer's license in a state with its lines of authority, and its appointment to an insurer, effective-dated |
| **product, form and rate table** | `products`, `forms`, `rate_tables` | A filed product for one line and state, versioned, with the forms and rating tables it uses and the filings that approved them |
| **submission and quote** | `submissions`, `quotes` | An application and each priced quote, with its rating inputs and the full rating worksheet |
| **policy and policy term** | `policies`, `policy_terms` | The contract and each term of it, new business and renewals |
| **policy transaction** | `policy_transactions` | Every change to a policy (new business, endorsement, cancellation, reinstatement, renewal, nonrenewal, audit, rewrite) with its effective date, processed time and written premium change |
| **policy version** | `policy_versions` | The policy as of an effective date range, as produced by a transaction, bitemporal |
| **risk** | `risks` | A thing or exposure insured, typed by line: vehicle, driver, dwelling, location, class code exposure, insured life, covered product |
| **coverage** | `coverages` | A coverage on a policy version and risk, with its limits, deductibles, premium and forms |
| **premium entry** | `premium_entries` | Written premium, taxes, fees and surcharges per transaction and coverage, from which earned and unearned are derived |
| **billing** | `billing_accounts`, `invoices`, `installments`, `payments` | Who is billed, on what plan, what was invoiced and what was paid (rails in Payments) |
| **commission** | `commissions` | What a producer earned or gave back on each policy transaction |
| **claim** | `claims` | A loss reported against a policy term, with loss date, reported date, cause, catastrophe code and status |
| **exposure** | `exposures` | One claimant against one coverage on a claim |
| **reserve, payment and recovery** | `reserves`, `claim_payments`, `recoveries` | Reserve changes by cost type, payments to payees, and money coming back (subrogation, salvage, deductibles, reinsurance) |
| **claim task** | `claim_tasks` | Every clock a claim law, regulation or guideline sets, with its due date and the rule that set it |
| **reinsurance contract and cession** | `reinsurance_contracts`, `cessions` | A treaty or facultative certificate with its layer and shares, and the premium and losses ceded to it |
| **document and notice** | `documents`, `notices` | Everything issued or sent, as rendered, with delivery proof; and the notices the law requires, with their deadlines |
| **regulatory filing and complaint** | `regulatory_filings`, `complaints` | A rate, rule or form filing with its SERFF tracking number and status, and a complaint with its clock |

Seven splits matter in every chapter:

- **An insurer on every policy, premium and claim.** The brand, the agency and the MGA are presentations; the insurer is the record, because rates are filed by insurer, premium tax and statutory statements are per insurer, and a liquidation takes one insurer's policies and claims and nothing else.
- **The transaction is the source; the version is a view.** A policy changes only through a `policy_transactions` row, and each transaction produces a `policy_versions` row for an effective range. Nobody edits a policy in place; a correction is another transaction. Guidewire's PolicyCenter documentation states the same rule: a policy can be created or modified only through the context of a policy transaction.
- **Two clocks on everything.** Effective time (when coverage, a change or a loss happened) and recorded time (when the system learned of it) are separate columns, and as-of queries ask for both: what was covered on the loss date, as we knew it on the day we paid ([Temporal Data](/docs/database/temporal-data#two-kinds-of-time)).
- **Premium is derived from entries.** Written premium is the sum of `premium_entries`; earned and unearned are computed from them with the earning rule and an as-of date; billed and collected live in billing. None of the four is a balance someone updates ([Recognition Schedules](/docs/money/accounting#recognition-schedules)).
- **Reserves are a history, not a field.** Each reserve change is a row with its cost type (indemnity, DCC, A&O), so incurred losses as of any date, and the development of every accident year, can be rebuilt.
- **Exposures carry the money.** Payments and reserves attach to an exposure, which names one claimant and one coverage, never to the claim as a lump sum, because limits, deductibles, statistical codes and reinsurance all apply by coverage.
- **The filed product is data with a date.** Products, forms and rate tables are versioned and tied to the filings that approved them, and every quote and transaction records the versions it used, so the system can show it charged the filed rate ([Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Money & Amounts](/docs/money/amounts)); columns each chapter owns are added there:

```sql
CREATE TABLE insurers (                    -- risk-bearing companies
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name         TEXT NOT NULL,
  naic_company_code  TEXT UNIQUE,           -- five digits; null for non-US insurers
  naic_group_code    TEXT,
  domicile           TEXT NOT NULL,         -- 'US-PA', 'US-FL', 'BM', 'GB-LLOYDS', ...
  form               TEXT NOT NULL CHECK (form IN ('stock', 'mutual', 'reciprocal',
                       'fraternal', 'risk_retention_group', 'captive', 'lloyds_syndicate')),
  status             TEXT NOT NULL CHECK (status IN ('active', 'runoff', 'supervision',
                       'rehabilitation', 'liquidation', 'merged'))
);

CREATE TABLE insurer_authorities (         -- licensed or eligible, per state and line
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  state              TEXT NOT NULL,         -- 'US-TX'
  basis              TEXT NOT NULL CHECK (basis IN ('admitted', 'surplus_lines_eligible',
                       'rrg_registered')),
  lines              TEXT[] NOT NULL,       -- statement line codes or line of business
  effective_from     DATE NOT NULL,
  effective_to       DATE
);

CREATE TABLE parties (                     -- people and organizations in any role
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  kind               TEXT NOT NULL CHECK (kind IN ('person', 'organization')),
  legal_name         TEXT NOT NULL,
  date_of_birth      DATE,                  -- persons only
  tax_id_ref         TEXT,                  -- a vault reference, never the number
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE party_roles (                 -- a party on a policy, claim or account
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  subject_type       TEXT NOT NULL CHECK (subject_type IN ('policy_version', 'claim',
                       'exposure', 'billing_account')),
  subject_id         UUID NOT NULL,
  role               TEXT NOT NULL,         -- 'named_insured', 'driver', 'mortgagee',
                                            -- 'owner', 'insured_life', 'beneficiary', ...
  rank               INT,                   -- first mortgagee, primary beneficiary
  share_bp           INT                    -- beneficiary share in basis points
);

CREATE TABLE producers (                   -- agencies, agents, brokers, MGAs
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  npn                TEXT UNIQUE,           -- National Producer Number
  kind               TEXT NOT NULL CHECK (kind IN ('individual', 'agency', 'mga',
                       'wholesaler', 'direct')),
  parent_id          UUID REFERENCES producers (id)  -- the agency an agent works for
);

CREATE TABLE producer_licenses (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  state              TEXT NOT NULL,
  license_number     TEXT NOT NULL,
  residency          TEXT NOT NULL CHECK (residency IN ('resident', 'nonresident')),
  lines_of_authority TEXT[] NOT NULL,       -- 'property', 'casualty', 'life', ...
  status             TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'expired',
                       'suspended', 'revoked')),
  expires_on         DATE
);

CREATE TABLE appointments (                -- a producer may sell for this insurer here
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  state              TEXT NOT NULL,
  lines              TEXT[] NOT NULL,
  effective_from     DATE NOT NULL,
  terminated_on      DATE,
  termination_reason TEXT                   -- 'for_cause' is reported to the state
);

CREATE TABLE products (                    -- a filed product, one line, one state
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  line               TEXT NOT NULL,         -- 'personal_auto', 'homeowners', 'cgl',
                                            -- 'workers_comp', 'term_life', ...
  state              TEXT NOT NULL,
  program            TEXT,                  -- an MGA program, a tier, a channel
  version            INT NOT NULL,
  effective_from     DATE NOT NULL,         -- new business on or after
  renewal_from       DATE,                  -- renewals on or after, when different
  effective_to       DATE,
  rate_filing_id     UUID,                  -- regulatory_filings (Filing Rates & Forms)
  form_filing_id     UUID,
  UNIQUE (insurer_id, line, state, program, version)
);

CREATE TABLE policies (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_number      TEXT NOT NULL UNIQUE,
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  product_id         UUID NOT NULL REFERENCES products (id),  -- at inception
  producer_id        UUID REFERENCES producers (id),          -- producer of record
  status             TEXT NOT NULL CHECK (status IN ('quoted', 'bound', 'in_force',
                       'cancelled', 'expired', 'nonrenewed', 'lapsed')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_terms (                -- new business and each renewal
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  term_number        INT NOT NULL,
  product_id         UUID NOT NULL REFERENCES products (id),  -- version rated on
  effective_at       TIMESTAMPTZ NOT NULL,  -- 12:01 a.m. local at the risk, as stored
  expires_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (policy_id, term_number)
);

CREATE TABLE policy_transactions (         -- the only way a policy changes
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  kind               TEXT NOT NULL CHECK (kind IN ('new_business', 'endorsement',
                       'cancellation', 'reinstatement', 'renewal', 'nonrenewal', 'audit',
                       'rewrite', 'reversal')),
  effective_at       TIMESTAMPTZ NOT NULL,
  processed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason             TEXT,                  -- 'nonpayment', 'insured_request', ...
  out_of_sequence    BOOLEAN NOT NULL DEFAULT FALSE,
  reverses_id        UUID REFERENCES policy_transactions (id),
  written_premium    BIGINT NOT NULL,       -- change in term premium, minor units
  idempotency_key    TEXT NOT NULL UNIQUE
);

CREATE TABLE policy_versions (             -- the policy as of an effective range
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  transaction_id     UUID NOT NULL REFERENCES policy_transactions (id),
  effective          TSTZRANGE NOT NULL,    -- when this version is the coverage
  recorded           TSTZRANGE NOT NULL,    -- when the system held it to be true
  EXCLUDE USING gist (policy_term_id WITH =, effective WITH &&, recorded WITH &&)
);

CREATE TABLE risks (                       -- what is insured, typed by line
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_version_id  UUID NOT NULL REFERENCES policy_versions (id),
  kind               TEXT NOT NULL CHECK (kind IN ('vehicle', 'driver', 'dwelling',
                       'location', 'building', 'class_exposure', 'insured_life',
                       'covered_product', 'other')),
  stable_key         UUID NOT NULL,         -- the same car across versions and terms
  attributes         JSONB NOT NULL         -- VIN, address, class code, payroll, ...
);

CREATE TABLE coverages (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_version_id  UUID NOT NULL REFERENCES policy_versions (id),
  risk_id            UUID REFERENCES risks (id),  -- null for policy-level coverages
  code               TEXT NOT NULL,         -- 'bi', 'pd', 'coll', 'comp', 'cov_a', ...
  limits             JSONB NOT NULL,        -- per person, per occurrence, aggregate
  deductible         BIGINT,
  term_premium       BIGINT NOT NULL,       -- full-term premium for this coverage
  form_ids           UUID[] NOT NULL DEFAULT '{}'
);

CREATE TABLE premium_entries (             -- written premium, taxes and fees
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  transaction_id     UUID NOT NULL REFERENCES policy_transactions (id),
  coverage_code      TEXT,                  -- null for policy-level fees
  kind               TEXT NOT NULL CHECK (kind IN ('premium', 'premium_tax', 'sl_tax',
                       'stamping_fee', 'policy_fee', 'installment_fee', 'surcharge',
                       'assessment')),
  amount             BIGINT NOT NULL,       -- signed, minor units
  earn_from          TIMESTAMPTZ NOT NULL,  -- earning window; fees may earn at once
  earn_to            TIMESTAMPTZ NOT NULL,
  state              TEXT NOT NULL,         -- where the risk is, for tax and stats
  accounting_date    DATE NOT NULL
);

CREATE TABLE claims (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_number       TEXT NOT NULL UNIQUE,
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  loss_at            TIMESTAMPTZ NOT NULL,
  reported_at        TIMESTAMPTZ NOT NULL,
  cause_of_loss      TEXT NOT NULL,         -- 'wind', 'collision', 'theft', 'death', ...
  loss_state         TEXT,
  cat_code           TEXT,                  -- the catastrophe event, if any
  status             TEXT NOT NULL CHECK (status IN ('draft', 'open', 'closed',
                       'reopened')),
  adjuster_id        UUID
);

CREATE TABLE exposures (                   -- one claimant, one coverage
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  coverage_code      TEXT NOT NULL,
  claimant_party_id  UUID NOT NULL REFERENCES parties (id),
  status             TEXT NOT NULL CHECK (status IN ('open', 'closed', 'reopened'))
);

CREATE TABLE reserves (                    -- every change, never an update
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),
  cost_type          TEXT NOT NULL CHECK (cost_type IN ('indemnity', 'dcc', 'ao')),
  change             BIGINT NOT NULL,       -- signed change in the open reserve
  reason             TEXT NOT NULL,         -- 'initial', 'estimate', 'payment', 'close'
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by        UUID NOT NULL
);

CREATE TABLE claim_payments (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),
  cost_type          TEXT NOT NULL CHECK (cost_type IN ('indemnity', 'dcc', 'ao')),
  amount             BIGINT NOT NULL CHECK (amount > 0),
  payee_party_ids    UUID[] NOT NULL,       -- joint payees: insured and mortgagee
  method             TEXT NOT NULL,         -- 'check', 'ach', 'push_to_card', ...
  status             TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'issued',
                       'cleared', 'voided', 'stopped')),
  issued_at          TIMESTAMPTZ,
  idempotency_key    TEXT NOT NULL UNIQUE
);

CREATE TABLE claim_tasks (                 -- the diary: every clock, with its source
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  kind               TEXT NOT NULL,         -- 'acknowledge', 'decide', 'pay', 'status_letter'
  due_at             TIMESTAMPTZ NOT NULL,
  rule_ref           TEXT NOT NULL,         -- 'FL 627.70131(1)(a)', 'NAIC 902 s7', ...
  done_at            TIMESTAMPTZ
);
```

`submissions`, `quotes`, `forms`, `rate_tables`, `billing_accounts`, `invoices`, `installments`, `payments`, `commissions`, `recoveries`, `reinsurance_contracts`, `cessions`, `documents`, `notices`, `regulatory_filings` and `complaints` are defined by the chapters that own them (below), on the same keys. Earned premium as of a date is a query over `premium_entries`, pro rata by time across each entry's earning window:

```sql
SELECT pe.state,
       pe.coverage_code,
       SUM(pe.amount) AS written,
       SUM(ROUND(pe.amount *
         GREATEST(0, LEAST(1,
           EXTRACT(EPOCH FROM (LEAST(:as_of, pe.earn_to) - pe.earn_from)) /
           NULLIF(EXTRACT(EPOCH FROM (pe.earn_to - pe.earn_from)), 0))))) AS earned
FROM premium_entries pe
WHERE pe.kind = 'premium'
  AND pe.accounting_date <= :as_of
GROUP BY pe.state, pe.coverage_code;
```

### Extended By

Each later chapter extends a defined part of this spine. The chapters and the core tables each one builds on are below, with the tables it is planned to add; a table is defined once, by the chapter named here, and later chapters reference it:

| Chapter | Extends |
| --- | --- |
| The Insurance Landscape | `insurers`; adds `market_share_snapshots`, `corporate_transactions` |
| How Insurers Make Money | `premium_entries`, `reserves`, `claim_payments`; adds `financial_periods`, `ratio_snapshots` |
| Who Carries the Risk | `insurers`; adds `insurer_relationships` (attorney-in-fact, pooling, holding company) |
| MGAs, Programs & Fronting | `producers`, `insurers`, `policies`; adds `programs`, `binding_authorities`, `bordereaux` |
| The State System | `insurers`, `insurer_authorities`; adds `jurisdictions`, `model_adoptions` |
| Filing Rates & Forms | `products`, `forms`, `rate_tables`; adds `regulatory_filings`, `filing_objections` |
| Market Conduct & Unfair Practices | `policies`, `claims`; adds `complaints`, `exam_requests` |
| Data, AI & Privacy Rules | `quotes`, `parties`; adds `models`, `model_inventory`, `privacy_notices` |
| Statutory Accounting & the Annual Statement | `premium_entries`, `reserves`, `cessions`; adds `statement_lines`, `annual_statement_runs` |
| Solvency & Capital | `insurers`; adds `capital_snapshots`, `rbc_calculations` |
| When Insurers Fail | `insurers`, `policies`, `claims`; adds `receiverships`, `guaranty_transfers` |
| Stressed & Residual Markets | `insurers`, `policies`; adds `residual_market_participation`, `depopulation_offers` |
| Agents, Brokers & Channels | `producers`, `policies`; adds `channels`, `sl_placements` |
| Producer Licensing & Appointments | `producers`, `producer_licenses`, `appointments`; adds `license_checks`, `ce_records` |
| Commissions & Agency Accounting | `policy_transactions`, `producers`; adds `commissions`, `commission_schedules`, `commission_statements` |
| Comparative Raters & Agency Systems | `quotes`, `producers`; adds `rater_requests`, `downloads` |
| Leads, Aggregators & Consent | `parties`; adds `leads`, `consents` |
| How a Rate Is Built | `products`, `quotes`; adds `rate_tables`, `rating_steps`, `territories` |
| What You May Rate On | `products`, `rate_tables`; adds `rating_factor_rules` |
| Consumer Reports & Third-Party Data | `parties`, `quotes`, `notices`; adds `consumer_report_orders`, `adverse_actions` |
| Telematics & Usage-Based Insurance | `risks`, `policies`; adds `telematics_enrollments`, `trip_summaries`, `driving_scores` |
| Underwriting Rules, Referrals & Models | `submissions`, `quotes`; adds `submissions`, `underwriting_rules`, `referrals`, `inspections` |
| Products, Coverages & Forms | `products`, `coverages`; adds `forms`, `coverage_definitions`, `form_attachments` |
| Quote, Bind & Issue | `quotes`, `policies`, `documents`; adds `quotes`, `binders`, `documents`, `delivery_consents` |
| Endorsements, Renewals & the Policy Transaction Model | `policy_transactions`, `policy_versions`; adds `renewal_offers` |
| Cancellation, Nonrenewal & Notice Law | `policy_transactions`, `documents`; adds `notices`, `notice_rules` |
| Billing & Premium Finance | `policies`, `premium_entries`; adds `billing_accounts`, `invoices`, `installments`, `payments`, `premium_finance_agreements` |
| First Notice, Coverage & Triage | `claims`, `exposures`; adds `incidents`, `coverage_positions` |
| Claim Handling Law & Clocks | `claim_tasks`; adds `claim_clock_rules` |
| Exposures, Reserves & Payments | `reserves`, `claim_payments`; adds `reserve_guidelines`, `payment_approvals` |
| Auto Claims & Total Loss | `exposures`, `risks`; adds `estimates`, `total_loss_valuations`, `salvage_titles` |
| Property Claims | `exposures`; adds `property_estimates`, `appraisals` |
| Subrogation, Salvage & Recovery | `claims`, `exposures`; adds `recoveries`, `subrogation_demands` |
| Fraud & SIU | `claims`, `parties`; adds `fraud_referrals`, `siu_investigations` |
| Bad Faith & Litigation | `claims`, `exposures`; adds `demands`, `litigation_matters` |
| Loss Reserving & Development | `reserves`, `claim_payments`; adds `loss_triangles`, `ibnr_estimates` |
| Catastrophe Events | `claims`; adds `cat_events` |
| Catastrophe Models & Their Regulators | `risks`; adds `exposure_snapshots`, `model_runs` |
| Reinsurance Structures | `policies`, `claims`; adds `reinsurance_contracts`, `reinsurance_layers` |
| Reinsurance Operations | `reinsurance_contracts`, `premium_entries`, `claim_payments`; adds `cessions`, `reinsurance_statements` |
| Cat Bonds, ILS & State Cat Funds | `reinsurance_contracts`; adds `ils_instruments` |
| Personal Auto | `risks`, `coverages`; adds `insurance_verifications`, `sr22_filings` |
| Homeowners & Renters | `risks`, `coverages`, `party_roles`; adds `property_characteristics` |
| Flood & the NFIP | `policies`, `risks`; adds `flood_determinations` |
| Pet & Travel Insurance | `risks`, `coverages` |
| The Commercial Lines Map | `risks`, `coverages`; adds `loss_runs`, `rating_modifications` |
| Professional & Management Liability | `coverages`, `claims`; adds `claims_made_terms` |
| Cyber Insurance | `submissions`; adds `security_assessments` |
| Surety Bonds | `policies`, `parties`; adds `bonds`, `indemnity_agreements` |
| Certificates of Insurance | `policies`, `party_roles`; adds `certificates` |
| Excess & Surplus Lines | `insurer_authorities`, `premium_entries`; adds `sl_placements`, `diligent_searches` |
| Crop Insurance | `policies`, `risks`; adds `acreage_reports` |
| Workers' Compensation | `policies`, `risks`; adds `wc_state_coverage` |
| Rating Workers' Comp & Premium Audit | `risks`, `policy_transactions`; adds `experience_mods`, `premium_audits` |
| Workers' Comp Claims | `claims`, `exposures`; adds `edi_reports`, `medical_bills` |
| Life Products as Data | `products`, `coverages`; adds `policy_values` |
| Annuities & Riders | `products`, `policy_values`; adds `riders`, `surrender_schedules` |
| Illustrations | `quotes`, `documents`; adds `illustrations` |
| Best Interest, Replacements & 1035 Exchanges | `submissions`, `parties`; adds `suitability_records`, `replacements` |
| Life Underwriting | `submissions`, `parties`; adds `evidence_orders`, `rate_class_decisions` |
| In-Force Administration | `policy_transactions`, `policy_values`; adds `policy_loans`, `beneficiary_changes` |
| Life Insurance & the Tax Code | `policy_values`, `premium_entries`; adds `tax_tests`, `tax_documents` |
| Death Claims & Unclaimed Benefits | `claims`, `party_roles`; adds `dmf_matches`, `escheatments` |
| Life Reserves, Capital & Private Equity | `policies`, `reinsurance_contracts`; adds `reserve_valuations` |
| Group Life & Disability | `policies`, `parties`; adds `group_census`, `certificates_of_coverage` |
| Embedded Insurance | `quotes`, `producers`; adds `distribution_partners`, `offer_presentations` |
| Service Contracts & Warranties | `policies`, `insurers`; adds `obligors`, `administrators` |
| Vehicle Service Contracts & GAP | `policies`, `claims`; adds `repair_authorizations` |
| Home Warranties & Product Protection | `policies`, `claims`; adds `service_dispatches` |
| Insurance System Architecture | all; adds `outbox_events`, `ledger_feeds` |
| Core Platforms | none; a vendor survey |
| ACORD & Data Standards | `policies`, `claims`; adds `acord_messages` |
| Regulatory & Statistical Reporting | `premium_entries`, `claims`; adds `stat_records`, `data_calls`, `tax_filings` |
| Replacing a Core System | all; adds `conversion_batches`, `conversion_mappings` |

## Auditing

The records in this chapter are the ones examiners, auditors, actuaries, reinsurers, courts and guaranty associations ask about later:

- **What was covered, when, as known when.** Every policy version with its effective and recorded ranges, so the coverage on any loss date, as the system knew it on any decision date, can be produced without reconstructing it.
- **The price was the filed price.** Every quote and transaction with the product, rate table and form versions it used and the full rating worksheet, so a market conduct examiner can rerate a sample and get the same premium.
- **Every premium dollar's path.** Every premium entry with its transaction, coverage, state and accounting date; earned and unearned rebuilt from them match the statutory statement; commissions, taxes and cessions tie back to the same entries.
- **Every reserve change and payment.** Every reserve movement with who made it and why, every payment with its exposure, coverage and payees, so incurred losses and development can be rebuilt as of any date.
- **Every clock and notice.** Every claim task with the rule that set it and when it was met, and every notice with its required lead time, mailing date and proof, because missed deadlines are what unfair claims practices findings and bad faith suits are made of.
- **Who sold it.** The producer of record on every transaction, with the license and appointment that were valid on that date.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Put an insurer on every policy, premium entry and claim,** and treat brands, agencies and MGAs as sellers on its behalf.
- **Change policies only through transactions** that produce effective-dated, bitemporal versions; never edit a policy in place.
- **Store both clocks everywhere:** effective and recorded time on policies, loss and reported time on claims, written and earned on premium.
- **Derive earned and unearned premium from entries** with the earning rule and an as-of date; never keep them as balances.
- **Record reserves as a history of changes by cost type,** and attach reserves and payments to exposures, not claims.
- **Version products, forms and rate tables with their filings,** and record the versions every quote used, with the full worksheet.
- **Compute every deadline from a rule and store it with the rule's citation,** for claims and for notices alike ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Check a producer's license and appointment as of the transaction date** before binding or paying commission.
- **Reuse the Payments model** for collecting premiums and paying claims, and the Property Tech, User-Generated Platforms and Commerce models where those books own the other side of the coverage.

## References

**Law and regulation**

- [15 USC 1012](https://www.law.cornell.edu/uscode/text/15/1012), the McCarran-Ferguson Act: insurance subject to state law, federal law not construed to supersede it unless it specifically relates to the business of insurance
- [15 USC 3902](https://www.law.cornell.edu/uscode/text/15/3902), the Liability Risk Retention Act's exemption of risk retention groups from non-chartering states' laws, its exceptions, and the notice that guaranty funds don't apply
- [Fla. Stat. 627.70131](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70131.html), acknowledgment within 7 days, investigation within 7 days and inspection within 30 days of proof of loss, and payment or denial of residential property claims within 60 days
- [Fla. Stat. 627.728](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.728.html), personal auto cancellation notice of 10 days for nonpayment and 45 days otherwise, and 45 days' notice of nonrenewal
- [Fla. Admin. Code 69O-170.010](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-69O-170-010), the prohibition of short-rate tables returning less than 90% of pro rata unearned premium without justification
- [N.Y. Ins. Law 3425](https://www.nysenate.gov/legislation/laws/ISC/3425), personal auto cancellation after the first 60 days only for nonpayment, license suspension or revocation, or fraud, and nonrenewal notice rules

**NAIC**

- [NAIC: 2025 Property and Casualty Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-property-casualty-market-share.pdf), 2025 direct premiums written of $1,109.79 billion, the top groups and their shares, and private passenger auto and homeowners totals
- [NAIC: 2025 Annual Property and Casualty and Title Insurance Industries Analysis Report (PDF)](https://content.naic.org/sites/default/files/2025-annual-property-and-casualty-and-title-insurance-industries-analysis-report.pdf), net premiums written and earned, loss, expense and combined ratios, underwriting gain, investment income, net income and policyholders' surplus for 2021-2025
- [NAIC: 2025 Annual Life Industry Commentary (PDF)](https://content.naic.org/sites/default/files/2025-annual-life-industry-commentary.pdf), direct written premium and deposits, annuity and life premium, capital and surplus and admitted assets for 2025
- [NAIC: Unfair Property/Casualty Claims Settlement Practices Model Regulation (#902)](https://content.naic.org/sites/default/files/model-law-902.pdf), 21 days to accept or deny a first-party claim after proof of loss and a letter every 45 days when more time is needed

**Regulators and guidance**

- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), $2.2 trillion of US direct premium in 2025, the US share of global premium, the state regulators and FIO's role
- [NCOIL: Model Unclaimed Life Insurance Benefits Act, April 2024 (PDF)](https://ncoil.org/wp-content/uploads/2025/12/NCOIL-Unclaimed-Benefits-Model-April-2024.pdf), semi-annual Death Master File comparison, the 90-day clock after a match and escheatment
- [Florida Department of Financial Services: Companies in receivership](https://www.myfloridacfo.com/division/receiver/companies), the insurers in liquidation as of November 2026
- [WSIA and FSLSO: US Surplus Lines Service Offices 2025 Annual Assessment, March 2026 (PDF)](https://slipplus.com/wp-content/uploads/documents/WSIA-SLAS-States-Report-March-2026.ai_SW.pdf), surplus lines tax and stamping fee rates by state, including California and Florida

**Filings**

- [Progressive: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231.htm) and [Exhibit 13](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231_d2.htm), net premiums written and statutory surplus, the 2.9 to 1 premium-to-surplus ratio and 3 to 1 benchmark, unearned premiums, loss and LAE reserves and the investment portfolio
- [Travelers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/86312/000008631226000065/trv-20251231.htm), about 1,100 P&C groups and 2,600 companies in the US

**Vendor documentation**

- [Guidewire: Overview of modifying jobs (PolicyCenter Cloud API)](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/123-PCpolicies/00-overview-of-modifying-jobs/c_overview_of_modifying_jobs.html), a policy created or modified only through a policy transaction, and the transaction types
- [MIB: Request your record](https://www.mib.com/request_your_record.html), what an MIB file holds, the seven-year window, and consumer disclosure rights under the FCRA
