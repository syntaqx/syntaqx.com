+++
title = "Applications & Screening"
description = "Rental applications and screening: FCRA duties, fair housing and fair-chance laws, income and identity checks, fraud, fee caps and the decision record."
category = "Property Tech Industry"
order = 1711
part = "Leasing"
tags = ["property-tech", "tenant-screening", "fcra", "fair-housing", "identity-verification", "fraud"]
+++

An application is the moment a prospect becomes someone the operator can say no to. Every adult in the household submits personal data, consents to a background check and usually pays a fee; a consumer reporting agency returns credit, eviction and criminal records and often a score; income and identity are verified; and the operator approves, approves with conditions, or denies against written criteria. Few steps in property management carry as much legal weight. The screening report is a consumer report under the Fair Credit Reporting Act, so accuracy, notices and disputes are federal duties. Every criterion is a fair housing question, and cities and states add their own rules on criminal history, sources of income, application fees and portable reports. The fraud the application has to catch (doctored pay stubs, synthetic identities, borrowed IDs) pulls in document forensics and biometrics, which bring their own privacy statutes.

This chapter covers the flow from submitted application to decision: how the platforms do it, the application itself, the FCRA, fair housing and disparate impact, criminal history and fair-chance laws, source of income, income and identity verification, document fraud, biometric privacy, AI scores, fees and portable reports, applicants without a US credit file, pets and assistance animals, and the decision record that ties it all together. Pricing the unit the application is for is [Revenue Management & Pricing](/books/property-tech/revenue-management); the guest card it starts from is [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours); the lease it ends in is [The Lease](/books/property-tech/the-lease). The Fair Housing chapter owns protected classes, reasonable accommodations and advertising as a whole. Legal status here is as of October 2026, and the rules are US law unless stated.

## How the Platforms Do It

Every suite sells screening, because it's transaction revenue: AppFolio reports it among its Value Added Services and Entrata's S-1 names "resident screening" among its Embedded Technology Solutions ([How the Money Is Made](/books/property-tech/property-business#how-the-money-is-made)). The products converge on the same bundle:

- **Screening inside the application.** Entrata's ResidentVerify runs inside the online application, so fees are collected before screening, with configurable rules to approve, conditionally approve or deny. AppFolio's FolioScreen Trusted Renter is "built directly into AppFolio" and lists "credit checks, criminal history, landlord-tenant history, and verified income, employment, and ID," and generates adverse action notices automatically. Buildium's screening is "powered by TransUnion" and covers credit, criminal and eviction records, with a published per-screen price that rises when the cost is passed to the applicant.
- **A score against the operator's criteria.** RealPage's Resident Screening uses all three credit bureaus, a criminal and sex offender registry search and eviction and collection records, and "combines multiple signals to determine an overall risk assessment based on the client's leasing criteria."
- **Landlord-contributed rental history.** RealPage describes "the industry's largest database (30M+) of actual rental payment records" from "more than 20,000 reporting communities": a payment history pool that its own customers furnish.
- **Income verification by data, not documents.** Entrata verifies through bank statements, direct payroll connections or bank-linked data covering up to 12 months; RealPage lists "Flexible Income Verification (Bank, Payroll, Docs)"; AppFolio names Nova Credit, Plaid and Snappt as partners.
- **Identity in layers.** RealPage lists "knowledge based, device & network, document, biometric, and contextual" checks. Entrata's PreciseID runs in the guest card flow and says about 70% of applicants are verified passively, with step-up checks for the rest, and combines traditional methods with "facial recognition and biometric authentication."
- **Document fraud as a specialist category.** Snappt analyzes "thousands of metadata elements" in submitted documents, verifies income through "connected payroll systems," and checks IDs with biometrics and "30+ checks." Entrata advertises "synthetic identity detection, ID scanning, and liveness checks" and AI review of bank statements and pay stubs; AppFolio uses "AI-powered fraud detection" to flag altered pay stubs and synthetic identities.
- **International credit.** Entrata integrated Nova Credit's Credit Passport in April 2025 to evaluate applicants on credit history from 16 countries, "translated into a format that aligns with U.S. underwriting standards."
- **Pets and assistance animals by specialist.** PetScreening and OurPetPolicy run pet profiles and assistance animal verification as services the operator plugs into the application, each describing its review as following HUD guidelines.
- **AI scores, carefully worded.** RealPage's AI Screening "functions as a decision-support tool rather than an automated decision-maker."

The design lesson is in what stays with the operator. Every vendor returns data and a recommendation; the operator owns the criteria, the decision, the adverse action notice and the fair housing exposure. A platform that integrates several screening agencies, or lets an operator switch them, needs its own criteria, decision and notice records, not the agency's.

## The Application

**Each adult applies.** An application is a household's request to lease a specific unit on specific terms, and every adult who will live there (and every guarantor) is a member with their own consent, their own reports and their own result. Minors are listed as occupants and never screened. A household's result is computed from its members' results by the criteria: combined income against the rent, the worst criminal or eviction finding, or each leaseholder separately, and the criteria say which. Roommates who don't know each other apply as one household for one unit; student housing's by-the-bed leasing changes that and is Student Housing's subject.

**It applies to a price.** An application is for a unit at a quoted rent, lease term and move-in date: a row in `rent_quotes` from [Revenue Management & Pricing](/books/property-tech/revenue-management). The quote's validity window matters because an income test is a ratio to rent, and approval at one price isn't approval at another. If the quote expires before the decision, the operator either honors it or re-quotes and re-runs the income test, and the record says which.

**The fee comes before the check.** Screening costs money per report, so the application fee is collected before any report is ordered, per member, under the fee caps and refund rules of the property's jurisdiction ([Application Fees and Portable Reports](#application-fees-and-portable-reports)). Mandatory recurring fees should be disclosed before the applicant pays; the Greystar settlement turned on fees disclosed "often after a nonrefundable application fee" ([The Property's Money](/books/property-tech/property-business#the-property-s-money)), and Listings, Websites & Marketing owns the price display.

**Staged where the law requires it.** Fair-chance laws in New York City and Cook County, and California's regulations, require financial and other qualifications to be decided before criminal history is looked at ([Criminal History and Fair-Chance Laws](#criminal-history-and-fair-chance-laws)). So the application has stages, and the reports ordered in each stage are recorded against it: pre-qualification (identity, income, credit, rental history), then, where allowed and only after a conditional offer, criminal history.

**The unit is held while it's decided.** A submitted application usually holds the unit for a short window, and two households can't both be approved into it. Holds and their expiry are [Reservations & Holds](/docs/architecture/reservations-and-holds); California's fee statute adds a rule that matters here: no fee may be charged when the landlord knows or should know no unit is available within a reasonable time.

## FCRA: The Screening Report Is a Consumer Report

A tenant screening company is a consumer reporting agency, and its report (including a "risk score or recommendation") is a consumer report. The FTC's guidance to landlords says so directly, and the obligations follow on both sides.

### Permissible purpose and consent

An agency may furnish a report "in accordance with the written instructions of the consumer" or to a user with a "legitimate business need ... in connection with a business transaction that is initiated by the consumer" (15 U.S.C. 1681b), and the user must certify its purpose. The FTC tells landlords they may get reports on applicants "who apply to rent housing or renew a lease." The platform records, per member: the consent text version they accepted, when, and for which application, and every report ordered points at that consent. A report pulled on a household member who didn't sign, or reused for a different property months later, has no recorded purpose.

### Accuracy and the matching problem

The agency must "follow reasonable procedures to assure maximum possible accuracy of the information concerning the individual about whom the report relates" (1681e(b)). The hard part in tenant screening is matching court records, which often carry a name and little else, to the applicant.

The cautionary case is the FTC's. On October 16, 2018, RealPage agreed to pay $3 million, which the FTC called the largest civil penalty it had obtained against a background screening company, to settle charges filed in the Northern District of Texas that from at least January 2012 to September 2017 it matched criminal records to applicants on an exact last name plus a non-exact match on first name, middle name or date of birth. The FTC's business blog spelled out the soft rules: a first name matched on its first three letters or a phonetic match; a first initial was enough if last name and date of birth matched; a date of birth a year off was enough if the names matched. Renters were wrongly linked to criminal records and, the FTC said, may have been turned down for housing. The order requires reasonable procedures for maximum possible accuracy.

The CFPB's November 2022 market report found the problem is structural: one study of 3.6 million eviction court records found 22 percent of state eviction cases were ambiguous or false records; screeners largely rely on "low-cost automated retrieval of court records" without manual verification, which can cost seven times as much; and prior rental payment history is "overwhelmingly not reflected" in screening reports. The CFPB also issued advisory opinions on name-only matching (2021) and background screening (2024); both were among the 67 guidance documents it withdrew effective May 12, 2025. The statute they interpreted didn't change, and the FTC order stands as the clearest statement of what unreasonable matching looks like.

The FCRA also bars most adverse items older than seven years: civil suits, judgments and arrest records, and "any other adverse item," with "records of convictions of crimes" excepted (1681c). Eviction filings are civil suits.

For an operator's platform, the lesson isn't to rebuild the agency's matching; it's to make matching visible and challengeable:

- **Store what the match was made on.** Each criminal or eviction record in a report keeps the identifiers it matched (full name, date of birth, address, the last four of the SSN where the source had them), so a reviewer can see a name-only match before relying on it ([Match Before Create](/docs/architecture/record-linkage#match-before-create) has the general discipline).
- **Never deny on a record the applicant can't see.** The applicant gets a copy, and the adverse action notice names the agency.
- **Treat matching rules as an agency selection criterion.** A screening vendor's matching rules, record sources, sealing and expungement handling, and dispute turnaround are diligence questions before signing, and their answers are kept.

### Adverse action notices

A user that takes adverse action "based in whole or in part" on a consumer report owes the consumer a notice (1681m(a)), and the FTC is explicit that adverse action includes denying the application, "requiring a co-signer on the lease," or requiring a larger deposit than other applicants, and applies even when the report played a small role. The notice must give:

- **The agency's name, address and phone number,** toll-free for a nationwide agency.
- **A statement that the agency didn't make the decision** and can't give the specific reasons.
- **The consumer's rights:** a free copy of the report from the agency within 60 days, and the right to dispute its accuracy or completeness.
- **The credit score, if one was used:** the score, its range, its source and date, and the key factors that hurt it, in order of importance.

The FTC calls written notices "the best practice," and they're the only kind a platform can prove. My rule: the notice is generated by the decision, not by a person remembering to send it, and it's generated for every member whose report contributed to an adverse outcome, including a conditional approval. Where several agencies supplied reports, each is named. The notice is a document version with its delivery record ([Notifications & Consent](/docs/architecture/notifications)), and the electronic delivery consent comes first ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first)).

Local law adds content: New York City requires copies of all criminal history the provider received and five business days to respond before a conditional offer is revoked, and Cook County requires a copy of the background check within five business days of receiving it. Those fields belong in the same notice record, resolved from the property's jurisdiction.

### Disputes

An applicant who disputes a report disputes it with the agency, which must reinvestigate free within 30 days (extendable by up to 15 days when the consumer sends more information), notify the furnisher within 5 business days, delete or modify information that is inaccurate, incomplete or unverifiable, and send results within 5 business days of finishing (1681i). The operator's part: keep the application open or the unit held while a dispute is pending where the criteria allow, re-decide on the corrected report, and record the dispute's outcome against the decision. Entrata's ResidentVerify says "disputes are handled in one centralized system," which is the right shape: a dispute is a case with a clock, not an email.

### Landlord-contributed rental history and furnisher duties

A rental history database built from landlords' own ledgers turns every contributing operator into a **furnisher** under the FCRA. The FTC warns landlords that reporting late rent or evictions to an agency brings obligations "under the FCRA and its Furnisher Rule." The statute's duties (1681s-2) are concrete:

- **Don't furnish what you know or have reasonable cause to believe is inaccurate.**
- **Correct and update:** a regular furnisher who learns information was incomplete or inaccurate must promptly notify the agency with corrections.
- **Flag disputes:** information the consumer has disputed with the furnisher can't be reported without noting the dispute.
- **Investigate disputes forwarded by the agency** within the agency's 30-day window, and modify, delete or block what's inaccurate, incomplete or unverifiable.

So the export to a rental history pool reads from the ledger as it stands, not a snapshot: a reversed late fee or a vacated eviction judgment has to reach the pool as a correction, and a dispute received through the resident portal has to flag the record before the next export. Rent reporting to credit bureaus as a resident product is Resident Financial Products & Ancillary Revenue's subject; the furnisher mechanics are the same.

## Fair Housing and Disparate Impact

The Fair Housing Act bars both intentional discrimination and practices with an unjustified discriminatory effect, and screening is where effects show up: criminal records, eviction filings, credit scores and income ratios fall unevenly by race, disability and familial status. HUD's discriminatory-effects rule (24 CFR 100.500) gives the three-step test: the challenger shows a practice "actually or predictably results in a disparate impact"; the provider must prove it's necessary to a "substantial, legitimate, nondiscriminatory interest," with evidence that "may not be hypothetical or speculative"; and the challenger can still win by showing a less discriminatory practice would serve that interest.

The federal guidance around it has moved fast:

- **May 2, 2024.** HUD issued guidance on applying the Fair Housing Act to the screening of rental applicants, including third-party screening companies and machine learning tools, saying providers and screeners share responsibility for screening that is "transparent, accurate, and fair." Its recommendations for housing providers included choosing only relevant criteria, publishing screening policies in advance, applying discretion to third-party results, giving applicants the records and reasons, and letting them contest a negative determination.
- **2025 to 2026 withdrawals.** HUD withdrew eight FHEO guidance documents effective September 17, 2025 (notice published April 6, 2026, 91 FR 17291), and thirteen Office of General Counsel documents effective September 25, 2025 (notice published July 17, 2026, 91 FR 44867). The 2024 screening guidance appears on neither list; I treat it as unwithdrawn but not a statement of HUD's current enforcement position.
- **The rule itself.** On January 14, 2026, HUD proposed removing 100.500 entirely (91 FR 1475), saying it is "appropriate for courts, not a Federal agency" to decide disparate impact liability while acknowledging *Inclusive Communities* holds such claims are cognizable under the Act. A supplemental proposal on August 10, 2026 (91 FR 51416) reopened comments through October 9, 2026. As of October 2026, 100.500 remains in the CFR and I found no final rule.

Whatever HUD does, disparate impact remains a claim private plaintiffs and states bring under the statute and state law. **Louis v. SafeRent Solutions** (D. Mass. 1:22-cv-10800) is the algorithmic case: voucher holders alleged that a screening score disproportionately harmed Black and Hispanic applicants using housing vouchers, under the Fair Housing Act and Massachusetts law. The court gave final approval to a $2.275 million settlement on November 20, 2024, with injunctive relief for applicants who rely on vouchers; press coverage reported SafeRent would no longer use AI-powered scores to evaluate voucher holders. No admission of fault was made.

For the platform, that means:

- **Criteria are published, versioned documents** that applicants can read before paying, and the decision cites the version ([The Decision Record](#the-decision-record)).
- **Every criterion has a recorded justification:** why an income multiple of this size, why a lookback of this length, with the evidence, because "necessary to a substantial interest" is the defense and it must not be speculative.
- **Outcomes are measured by group where lawful,** so a criterion with a disparate effect is found by the operator before it's found by a plaintiff. Demographic data collected for that monitoring stays separate from the decision path.
- **The vendor's score is the operator's practice.** Using a third party's model doesn't move the liability; the operator chose to use it.

The Fair Housing chapter covers protected classes, reasonable accommodations, advertising and HUD's complaint process in full.

## Criminal History and Fair-Chance Laws

**Federal guidance, withdrawn.** HUD's Office of General Counsel guidance of April 4, 2016 on the use of criminal records was the basis for a decade of screening policies: arrest records aren't evidence of conduct, blanket bans have a disparate impact, and policies should be tailored. HUD Secretary Scott Turner's letter of November 25, 2025 rescinded it, along with Notice PIH 2015-19 on arrest records and the 2022 FHEO memo implementing the 2016 guidance, saying the guidance had a chilling effect on lawful screening. The withdrawals were formalized in the April 6 and July 17, 2026 notices above. As of October 2026 there is no federal guidance document limiting criminal history screening by private landlords; the Fair Housing Act's effects standard, as courts apply it, still does.

**State and local law, growing.** The rules that bind most operators now come from cities, counties and states, and they share a shape: no arrests, no sealed records, a lookback window, financial screening first, an individualized assessment and a chance to respond.

| Jurisdiction | In force | Lookback | Process |
| --- | --- | --- | --- |
| **New York City** Fair Chance Housing Law | January 1, 2025 | Felonies within 5 years of release (or sentencing if no jail time), misdemeanors within 3; sex offense registry convictions only if registration is currently required | Non-criminal screening first; written conditional offer committing a unit; Notice of Rights before the check; copies of all criminal history and 5 business days to respond before revoking; individualized assessment and a written decision |
| **Cook County** Just Housing Amendment | January 1, 2020 (enforced from February 1, 2020) | Convictions within 3 years; no arrests | Prequalify first; then the background check and an individualized assessment; copy of the check within 5 business days; 5 business days to dispute; 3 business days to decide; denial only if necessary to protect against "a clear risk to personal safety and/or property" |
| **California** Civil Rights Department regulations | In force | No arrests without conviction; no sealed, expunged, juvenile or diversion records unless the applicant raises them | No blanket bans; financial qualifications first; written policy; an opportunity to present mitigating information |
| **Seattle** Fair Chance Housing Ordinance | In force, narrowed | Bars adverse action based on criminal history | The Ninth Circuit held in *Yim v. City of Seattle* (March 21, 2023) that the ban on even asking about criminal history violated the First Amendment, upheld the adverse action provision, and remanded on severability |

New York City's never-considered list is worth copying as a data structure: arrests without further action, pending cases, adjournments in contemplation of dismissal, youthful offender and juvenile adjudications, sealed or expunged convictions, favorable terminations, and non-criminal violations. Its exemptions are narrow (owner-occupied buildings with two or fewer units; government-funded housing required or authorized to act on criminal history, which still follows the rest of the law).

My rule: criminal screening is a **stage with a gate**, not a column in the report. The criteria for each jurisdiction say whether criminal history may be considered at all, after which step, with which lookback per offense class, and which record types are always excluded; the agency is asked only for what the stage allows; and an adverse criminal decision can't be recorded without the assessment and the applicant's response window. The jurisdiction rules are effective-dated data ([Rules as Data](/docs/architecture/rules-as-data)), resolved from the property's location, and Landlord-Tenant Law as Data holds the matrix.

## Source of Income

Poverty & Race Research Action Council estimates that over 60% of voucher holders now live where source-of-income laws protect them. Its compilation (updated March 2026) lists source-of-income discrimination laws in 19 states plus the District of Columbia and Guam, with four more states (Maine, Minnesota, Texas and Wisconsin) whose laws are weakened by court interpretation or don't reach vouchers, and many more cities and counties. California's Civil Rights Department, for example, says state law "protects tenants from discrimination based on how a tenant will be paying rent," including Section 8 vouchers, SSI and SSDI.

The screening consequences:

- **Income tests count the household's share.** An income multiple applied to the full rent fails voucher holders whose subsidy pays most of it. My rule: the income test runs against the portion the household pays, and the criteria say so explicitly; it's the cheapest way to avoid both a source-of-income claim and the kind of score the SafeRent settlement stopped applying to voucher holders.
- **Every lawful income source counts.** Benefits, child support, pensions, gig income and assets are income; a criterion that accepts only pay stubs excludes them by design.
- **The application records the source,** so the income test and its basis can be audited, and the jurisdiction's protection is resolved from the property.

Subsidized & Affordable Housing covers program rules (income limits, certification, the voucher's own inspection and contract) from both sides.

## Income and Identity Verification

**Income.** Uploaded pay stubs and bank statements are the easiest documents to fake, so the platforms have moved to verification at the source: a consumer-permissioned bank connection that reads deposits, a payroll connection that reads employer records, or a document check when neither is possible. The verification record keeps the method, the provider, the period covered, the computed monthly income by source, and what the applicant consented to share; never the bank credentials. Whatever the method, the criteria define what counts as income and how it's annualized, and the applicant can still submit documents when they have no connectable account: requiring a bank login excludes the unbanked.

**Identity.** The platforms layer identity checks the way payments does ([Rules and Models Together](/docs/architecture/risk-scoring#rules-and-models-together)):

- **Passive data checks first:** the name, date of birth, SSN and address agree with each other and with bureau records, and the device and network look ordinary.
- **Step up when they don't:** a photographed government ID, checked for tampering and read for its data, and a selfie matched to the ID's photo with a **liveness** check that the selfie is a live person rather than a photo or replay.
- **A person when the machine is unsure,** with the evidence in front of them ([Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle)).

The same identity check can run at the self-guided tour, so the person who toured is the person who applied; that tour flow is [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours)'s. Verification failure is not a denial reason by itself: an unverified identity is a step-up or a review, and a denial on it is a decision like any other with a recorded reason.

## Synthetic Identity and Document Fraud

Application fraud in rental housing takes three forms, each with a different check:

- **Altered documents:** a real pay stub with a bigger number, a bank statement with edited balances. Document forensics reads file metadata, fonts and structure for signs of editing, and Snappt, Entrata and AppFolio each sell it. The check returns a finding per document (clean, edited, inconclusive) with the indicators, never just a yes or no.
- **Synthetic identities:** an invented person built from a real SSN (often a child's or a dormant one) and a made-up name, with a thin but clean credit file. Identity data that is internally consistent but new, an SSN never associated with the name before, and no history outside the credit file are the signals; the suites market synthetic identity detection as a distinct check.
- **Borrowed or stolen identities:** a real person's identity with someone else applying. The ID-and-selfie match is the check, and it's why tours and applications use the same verification.

Fraud findings are risk decisions, so they follow [Automated Risk Decisions](/docs/architecture/risk-scoring): a band for automatic action, a band for review, labels when a lease later defaults, and appeals. Two cautions specific to housing. A fraud finding that leads to denial is still a decision on information that may come from a consumer report, so the adverse action question has to be asked, not assumed away. And a "fraud" flag is a high-impact label: a document marked inconclusive because the employer's payroll system produces odd PDFs isn't fraud, and the applicant gets a way to supply something else.

## Biometric Privacy

A selfie match and a liveness check create biometric data, and three states regulate it directly:

- **Illinois.** The Biometric Information Privacy Act (740 ILCS 14, 2008) requires consent before collecting or disclosing biometric identifiers, timely destruction, and gives "any individual aggrieved by a violation" a private right of action with damages of $1,000 per violation, or $5,000 if intentional or reckless. It's the most stringent of the state laws and the one that drives design.
- **Washington.** RCW 19.375 requires notice and consent, or a mechanism to prevent later commercial use, before enrolling a biometric identifier in a database for a commercial purpose; bars selling or disclosing it without consent outside narrow exceptions; and allows retention "no longer than is reasonably necessary."
- **Texas** has its own biometric identifier statute.

The design that works everywhere is the strictest one: a separate biometric consent, in plain words, before the camera opens, naming who processes the image and how long it's kept; the vendor holds the template, not the operator; the platform stores the outcome (match, no match, liveness passed) and a reference, never the image or template; and a destroy-by date is set at capture and enforced ([Data Retention & Deletion](/docs/architecture/data-retention)). Applicants who decline biometrics get another route (an in-person ID check at the leasing office), because a biometric gate with no alternative is also an accessibility and fair housing problem. Records, Privacy & Audits covers state privacy laws as a whole.

## AI Scores: Decision Support, Not Decision-Maker

A screening score that predicts lease performance is a model, and RealPage's choice of words for its AI screening is the right posture for any of them: "a decision-support tool rather than an automated decision-maker." The general machine is in [Automated Risk Decisions](/docs/architecture/risk-scoring); what housing adds:

- **The score is part of the consumer report.** The FTC counts a screening company's "risk score or recommendation" as a consumer report, so a score-driven denial carries an adverse action notice, and a credit score used must be disclosed with its key factors.
- **The score is a fair housing practice.** SafeRent is the example: the operator's use of a third-party score with an effect on voucher holders was the claim. A score's inputs, its version, and its effect by group are the operator's evidence.
- **Rules and people decide.** The score is one input to criteria that live in data; a band between automatic approval and automatic denial goes to a person, with the report and the applicant's own information ([Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle)). Where a jurisdiction requires an individualized assessment, nothing automatic may deny.
- **Explain and appeal.** The applicant gets the reasons in terms they can act on and a way to contest them, reviewed by someone who didn't make the first decision ([Explanations and Appeals](/docs/architecture/risk-scoring#explanations-and-appeals)).
- **Language models don't decide.** An AI leasing agent may collect an application, answer questions about criteria and chase missing documents; the decision is made in code against the criteria version ([Decide in Code](/docs/architecture/ai-agents#decide-in-code)). AI in Property Management covers agent governance across the platform.

## Application Fees and Portable Reports

Application fees are capped, refundable or waivable in a growing list of places, and the rules are precise enough to encode:

| Jurisdiction | Rule |
| --- | --- |
| **California** (Civil Code 1950.6) | Fee limited to actual out-of-pocket costs plus the reasonable value of time, and capped at $30 per applicant, adjustable annually by CPI; no fee when the landlord knows or should know no unit is available within a reasonable time; an itemized receipt; a copy of the consumer credit report within 7 days of receiving it; refunds within 7 days to applicants not considered; nothing prevents accepting a reusable screening report under Civil Code 1950.1 |
| **New York** (Real Property Law 238-a) | No fees except for background and credit checks, at actual cost or $20, whichever is less; waived if the applicant provides a background or credit check from the past 30 days; not collectible without giving the applicant a copy of the check and the screening company's receipt or invoice; waivers void |
| **Colorado** (HB23-1099, effective August 7, 2023) | Landlords must accept a portable tenant screening report prepared by an agency within the previous 30 days, covering employment and income verification, rental and credit history and criminal history; a landlord who accepts one may charge no application fee or fee to access it; landlords that take only one application fee at a time and refund it within 20 calendar days are exempt; the landlord must disclose this before collecting information that would generate a fee |

So a fee is never a constant on the property. It's computed per member from the jurisdiction's rule version, with the cap, the waiver conditions, the receipt contents and the refund deadline, and the refund deadline is a stored date that a job enforces ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). A **portable report** is a screening report the applicant already paid for: the platform has to accept it as a report source, check its age against the rule, record that it waived the fee, and run the same criteria over it. The money itself (a card or ACH payment, its refund) moves through [Payment States & Ledgers](/docs/payments/payment-states); application fees are usually income to the owner or the screening vendor, never trust money, and Charges & Resident Ledgers covers where they post.

## International Applicants and No SSN

Applicants new to the US (students, transferred employees, immigrants) often have no SSN and no US credit file, and a criteria set that requires a credit score denies all of them on a missing field. The platforms' answers:

- **Foreign credit files.** Nova Credit, which describes itself as operating "as a consumer reporting agency under the Fair Credit Reporting Act," translates credit history from abroad; Entrata's integration covers 16 countries. The report is a consumer report like any other, with the same notices.
- **Alternative evidence:** an ITIN, a passport and visa as identity documents, an offer letter or university enrollment, bank-verified income or assets, or a guarantor (including an institutional one, Insurance, Deposits & Guarantees' subject).
- **Criteria that say what substitutes.** "No credit history" is an outcome distinct from "poor credit history," and the criteria state what replaces the score: a larger deposit within legal limits, a guarantor, or prepaid rent where the jurisdiction allows it.

National origin is a protected class, and California's Civil Rights Department publishes a fact sheet on immigration rights in housing. My rule: ask for identity documents the criteria accept, never for citizenship.

## Pets and Assistance Animals

Pets are a lease term with money attached (deposit, fee, monthly pet rent, breed and weight limits), screened by collecting a profile per animal: species, breed, weight, vaccination and license records, and the owner's history. Specialists run this as a service: PetScreening lists "3.5M+ Generated Profiles," and both it and OurPetPolicy verify assistance animal requests.

**Assistance animals are not pets.** A request to keep an animal for a disability is a reasonable accommodation request under the Fair Housing Act, and pet rules, fees and breed limits don't apply to it. HUD's FHEO-2020-01 notice (January 28, 2020) gave providers step-by-step best practices: providers may ask for supporting information when the disability or need isn't apparent, including from a health care professional; documentation sold online as animal "certifications or registrations" is not by itself reliable; and animals not traditionally kept in homes need more analysis. HUD withdrew FHEO-2020-01 effective September 17, 2025 (91 FR 17291), along with the 2013 notice on service and assistance animals. The statutory duty to accommodate didn't change; the practical framework is now a matter for the operator's counsel and state law, and the Fair Housing chapter owns it.

For the platform: the assistance animal path is separate from pet screening from the first screen, never charges a pet fee or deposit, never gates the housing decision on the animal's paperwork, and keeps disability-related information in an access-restricted record apart from the application file the leasing team sees. A third-party verifier's outcome is an input; the accommodation decision is the operator's.

## The Decision Record

Everything above ends in one record: what the household applied for, which criteria version decided it, what each report and verification said, what the outcome was and why, which notices went out, and what happened on appeal. The shape is [The Decision Record](/docs/architecture/risk-scoring#the-decision-record); the housing specifics:

- **Criteria are versioned and published.** A criteria version is a document (what the applicant reads) and data (what the code evaluates), approved by someone, effective for a date range, scoped to a property or a portfolio. An application binds to the version in force when it was submitted, and a change mid-application doesn't change the rules for applicants already in flight ([Versioned Entities](/docs/database/temporal-data#versioned-entities)).
- **Outcomes are more than yes and no.** Approve; approve with conditions; deny; or pending a step the law requires (an individualized assessment, the applicant's response window, a dispute). Conditions are typed: an additional deposit up to the jurisdiction's limit, a guarantor, prepaid rent where allowed, a co-signer. A conditional approval based on a report is an adverse action, so it generates a notice.
- **Reasons are codes, and codes map to notices.** "Income below 2.5x the household's share of rent," "eviction judgment within the lookback," "identity not verified": each reason is a code in the criteria version, so the notice, the applicant portal and the audit read the same reason.
- **Inputs as they were.** The reports and verifications the decision used are referenced by ID, with the result summaries copied into the decision, because a report reissued after a dispute is a different report.
- **Appeals and re-decisions supersede.** A corrected report, a mitigation submission, an individualized assessment or a manager override writes a new decision pointing at the one it replaces ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)), and an override requires a reason and a person with the authority to give one.

## How to Build It

Screening extends `people` and `households` from [The Core Data Model](/books/property-tech/property-business#the-core-data-model), references `guest_cards` from Leads, CRM, Tours & the Leasing Center and `rent_quotes` from Revenue Management & Pricing, and points forward to the `leases` row The Lease creates. Report contents and SSNs are encrypted at the field level ([Envelope Encryption](/docs/security/encryption-at-rest#envelope-encryption)); what follows stores results, references and decisions.

```sql
CREATE TABLE screening_criteria (        -- a published, versioned screening policy
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID REFERENCES properties (id),   -- null: portfolio default
  portfolio_id      UUID REFERENCES portfolios (id),
  version           INT NOT NULL,
  valid_during      DATERANGE NOT NULL,
  rules             JSONB NOT NULL,      -- income multiple and basis, credit, eviction and
                                         -- criminal lookbacks, excluded record types, stages
  reason_codes      JSONB NOT NULL,      -- code -> applicant-facing text
  justification     TEXT NOT NULL,       -- why each criterion; the disparate impact defense
  document_ref      TEXT NOT NULL,       -- the published text applicants read
  approved_by       UUID NOT NULL,       -- staff user
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(property_id, portfolio_id) = 1),
  UNIQUE (tenant_id, property_id, portfolio_id, version),
  EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&) WHERE (property_id IS NOT NULL)
);

CREATE TABLE applications (              -- a household's request to lease one unit at one price
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  unit_id           UUID NOT NULL REFERENCES units (id),
  household_id      UUID NOT NULL REFERENCES households (id),
  guest_card_id     UUID REFERENCES guest_cards (id),
  rent_quote_id     UUID NOT NULL REFERENCES rent_quotes (id),
  criteria_id       UUID NOT NULL REFERENCES screening_criteria (id),  -- bound at submission
  stage             TEXT NOT NULL CHECK (stage IN ('pre_qualification', 'conditional_offer',
                      'criminal_review', 'complete')),
  status            TEXT NOT NULL CHECK (status IN ('started', 'submitted', 'screening',
                      'review', 'approved', 'conditionally_approved', 'denied', 'withdrawn',
                      'expired')),
  language          TEXT NOT NULL DEFAULT 'en-US',
  submitted_at      TIMESTAMPTZ,
  conditional_offer_at TIMESTAMPTZ,      -- fair-chance gate: criminal checks only after this
  lease_id          UUID REFERENCES leases (id),   -- set when The Lease generates it
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE application_members (       -- each adult and guarantor applies
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  application_id       UUID NOT NULL REFERENCES applications (id),
  person_id            UUID NOT NULL REFERENCES people (id),
  role                 TEXT NOT NULL CHECK (role IN ('applicant', 'co_applicant', 'guarantor',
                         'occupant')),   -- occupants (minors) are listed, never screened
  screening_consent_version TEXT,        -- the authorization text accepted
  screening_consented_at    TIMESTAMPTZ,
  income_basis         TEXT CHECK (income_basis IN ('full_rent', 'household_share')),
  income_sources       TEXT[],           -- wages, voucher, benefits, support, assets, ...
  result               TEXT CHECK (result IN ('pass', 'conditional', 'fail', 'pending')),
  UNIQUE (application_id, person_id),
  CHECK (role = 'occupant' OR screening_consented_at IS NOT NULL OR result IS NULL)
);

CREATE TABLE application_fees (          -- per member, under the jurisdiction's rule
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  member_id         UUID NOT NULL REFERENCES application_members (id),
  fee_rule_version  TEXT NOT NULL,       -- e.g. 'US-NY:RPL-238-a@v3'
  amount            BIGINT NOT NULL CHECK (amount >= 0),  -- minor units
  currency          CHAR(3) NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('due', 'paid', 'waived', 'refunded')),
  waiver_reason     TEXT CHECK (waiver_reason IN ('portable_report', 'recent_report',
                      'fee_not_allowed', 'operator')),
  payment_id        UUID REFERENCES payments (id),
  receipt_ref       TEXT,                -- itemized receipt or the agency invoice
  refund_due_by     DATE,                -- computed from the rule; a job enforces it
  refunded_at       TIMESTAMPTZ,
  CHECK (status <> 'waived' OR waiver_reason IS NOT NULL)
);

CREATE TABLE screening_reports (         -- a consumer report, or a portable one supplied
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  member_id         UUID NOT NULL REFERENCES application_members (id),
  kind              TEXT NOT NULL CHECK (kind IN ('credit', 'eviction', 'criminal',
                      'rental_history', 'international_credit', 'score', 'portable')),
  stage             TEXT NOT NULL CHECK (stage IN ('pre_qualification', 'criminal_review')),
  agency_name       TEXT NOT NULL,       -- copied: the notice must name it as it was
  agency_address    TEXT NOT NULL,
  agency_phone      TEXT NOT NULL,
  agency_report_id  TEXT NOT NULL,
  prepared_at       TIMESTAMPTZ NOT NULL,   -- portable reports are age-checked against this
  received_at       TIMESTAMPTZ NOT NULL,
  score             INT,
  score_model       TEXT,                -- name, range and date for the notice
  score_factors     TEXT[],              -- key factors, in order
  findings          JSONB NOT NULL,      -- per record: type, date, disposition, matched_on
  supersedes_id     UUID REFERENCES screening_reports (id),  -- reissued after a dispute
  copy_delivered_at TIMESTAMPTZ,         -- where law requires giving the applicant a copy
  dispose_after     DATE NOT NULL,
  UNIQUE (tenant_id, agency_name, agency_report_id)
);

CREATE TABLE verifications (             -- income, identity, document and animal checks
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  member_id         UUID NOT NULL REFERENCES application_members (id),
  kind              TEXT NOT NULL CHECK (kind IN ('identity_data', 'identity_document',
                      'liveness', 'income_bank', 'income_payroll', 'income_document',
                      'document_authenticity', 'employment', 'rental_history',
                      'pet_profile')),
  provider          TEXT NOT NULL,
  provider_ref      TEXT NOT NULL,
  outcome           TEXT NOT NULL CHECK (outcome IN ('pass', 'fail', 'inconclusive',
                      'review')),
  indicators        TEXT[],              -- what fired; never the raw biometric
  monthly_income    BIGINT,              -- minor units, for income kinds
  currency          CHAR(3),
  biometric         BOOLEAN NOT NULL DEFAULT FALSE,
  biometric_consent_version TEXT,
  biometric_destroy_by DATE,             -- set at capture, confirmed with the vendor
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (NOT biometric OR (biometric_consent_version IS NOT NULL
                           AND biometric_destroy_by IS NOT NULL))
);

CREATE TABLE screening_decisions (       -- append-only; appeals supersede
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  application_id    UUID NOT NULL REFERENCES applications (id),
  criteria_id       UUID NOT NULL REFERENCES screening_criteria (id),
  outcome           TEXT NOT NULL CHECK (outcome IN ('approve', 'conditional', 'deny',
                      'pending_assessment', 'pending_response')),
  conditions        JSONB NOT NULL DEFAULT '[]',  -- [{type: 'additional_deposit', amount},
                                                  --  {type: 'guarantor'}, ...]
  reason_codes      TEXT[] NOT NULL DEFAULT '{}',
  report_ids        UUID[] NOT NULL DEFAULT '{}',
  verification_ids  UUID[] NOT NULL DEFAULT '{}',
  inputs            JSONB NOT NULL,      -- result summaries as the decision saw them
  model_version     TEXT,                -- any score used
  is_adverse        BOOLEAN NOT NULL,    -- deny, or conditions, based on a report
  assessment        JSONB,               -- individualized assessment where law requires
  decided_by        TEXT NOT NULL,       -- 'system:screening@<version>' or 'user:<id>'
  override_reason   TEXT,
  supersedes_id     UUID REFERENCES screening_decisions (id),
  decided_at        TIMESTAMPTZ NOT NULL,
  CHECK (outcome <> 'deny' OR cardinality(reason_codes) > 0),
  CHECK (outcome <> 'conditional' OR jsonb_array_length(conditions) > 0),
  CHECK (decided_by LIKE 'user:%' OR override_reason IS NULL)
);

CREATE TABLE adverse_action_notices (    -- one per member whose report contributed
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  decision_id       UUID NOT NULL REFERENCES screening_decisions (id),
  member_id         UUID NOT NULL REFERENCES application_members (id),
  template_version  TEXT NOT NULL,       -- federal content plus the jurisdiction's
  agencies          JSONB NOT NULL,      -- name, address, phone of every agency relied on
  credit_score      JSONB,               -- score, range, source, date, key factors
  local_content     JSONB,               -- e.g. criminal history copies and respond_by
  respond_by        DATE,                -- a local response window, if any
  channel           TEXT NOT NULL CHECK (channel IN ('email', 'portal', 'mail', 'in_person')),
  document_ref      TEXT NOT NULL,       -- the notice as sent
  delivered_at      TIMESTAMPTZ NOT NULL,
  UNIQUE (decision_id, member_id)
);
```

Decisions in the shape:

- **The application binds a price and a policy.** `rent_quote_id` and `criteria_id` are set at submission and never edited; a re-quote or a policy change on an open application is a new application or an explicit, logged rebind.
- **The fair-chance gate is a constraint, not a habit.** A criminal report can't be ordered before `conditional_offer_at` where the jurisdiction's rule requires it; the order command checks the stage, and the report's `stage` column records which step it belonged to.
- **Agency details are copied, not joined.** The notice must name the agency as it was, and vendors rename and move.
- **A notice is generated by the decision.** Any decision with `is_adverse` produces a notice per contributing member in the same transaction as the decision, through the outbound gate in [Notifications & Consent](/docs/architecture/notifications#one-outbound-gate); a decision without its notices fails an audit query, not a person's memory.
- **Fees are computed from a rule version** with their refund deadline stored, so a cap change doesn't rewrite old receipts and a missed refund is a query.
- **Biometrics are outcomes and a destroy-by date,** never images or templates.
- **Disposal is scheduled.** Each report has `dispose_after` from the retention schedule ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)); the decision keeps the summaries it used after the report itself is gone.

Events: `application.submitted`, `application.fee_paid`, `screening.report_received`, `screening.decided` (with outcome and whether adverse), `screening.notice_sent`, `screening.dispute_opened`, `application.approved`, which The Lease subscribes to when it generates the packet.

A household's history comes back: the people who left owing money may apply again years later. Matching a new application to an old resident is [Matching, Merging & Many Sources](/docs/architecture/record-linkage), and whether the old ledger may be used is the criteria's call, within the FCRA's seven-year limit when it arrives through a report.

## Auditing

Screening records are asked for by applicants, regulators, fair housing testers and plaintiffs, often years later:

- **Why was this household denied?** The decision, its criteria version, the reason codes, the reports and verifications it relied on as they were, the notices sent and when, and every superseding decision.
- **Did every adverse decision get its notice?** A query joining adverse decisions to notices per contributing member, run continuously, with any gap an incident.
- **Was the fair-chance process followed?** Conditional offer timestamps before every criminal report in a covered jurisdiction; response windows elapsed before every revocation; an assessment on every criminal denial.
- **Were fees lawful?** Fee rule version, amount, receipt and refund timing per member.
- **What effect do the criteria have?** Approval, conditional and denial rates by criterion and, where lawful, by group, across criteria versions: the evidence the operator needs to justify a criterion or change it.
- **Who saw what.** Access to screening reports and disability-related records is logged ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)), because both are among the most sensitive data the platform holds.

The mechanics are in [Audit Trails](/docs/architecture/audit-trails); retention periods per record type and the privacy laws around them are Records, Privacy & Audits.

## What This Means for the System You Build

- **Treat the screening report as a consumer report:** recorded consent and purpose per member, agency details copied, a copy to the applicant where law requires, and disposal on a schedule.
- **Generate adverse action notices from decisions,** including conditional approvals, with every agency named and the credit score and its factors when one was used.
- **Make matching visible:** store what each record matched on, and never deny on a record the applicant hasn't been shown.
- **Version and publish the criteria,** bind each application to a version, and record why each criterion exists.
- **Encode fair-chance rules as stages with gates,** per jurisdiction: financial screening first, criminal history only after a conditional offer, lookbacks and excluded records as data, an assessment and a response window before any adverse decision.
- **Run income tests on the household's share** and count every lawful source of income.
- **Verify income and identity at the source,** step up on doubt, and send uncertainty to a person rather than a denial.
- **Keep biometrics out of your database:** separate consent, vendor-held templates, a destroy-by date, and a non-biometric route.
- **Use scores as decision support:** rules and people decide, every decision is explainable, and appeals supersede rather than edit.
- **Compute fees from the jurisdiction's rule,** accept portable reports where required, and enforce refund deadlines with a job.
- **Separate assistance animals from pets** from the first screen, with no pet fees and restricted access to disability information.
- **If you furnish rental history, act as a furnisher:** corrections, dispute flags and investigations flow to the pool.

## References

**Statutes and regulations**

- [15 U.S.C. 1681b: Permissible purposes of consumer reports](https://www.law.cornell.edu/uscode/text/15/1681b), written instructions of the consumer, legitimate business need in a consumer-initiated transaction, certification of purpose
- [15 U.S.C. 1681c: Requirements relating to information contained in consumer reports](https://www.law.cornell.edu/uscode/text/15/1681c), the seven-year limits on civil suits, judgments, arrest records and other adverse items, and the conviction exception
- [15 U.S.C. 1681e: Compliance procedures](https://www.law.cornell.edu/uscode/text/15/1681e), maximum possible accuracy and notices to users and furnishers
- [15 U.S.C. 1681i: Procedure in case of disputed accuracy](https://www.law.cornell.edu/uscode/text/15/1681i), the 30-day reinvestigation, 15-day extension, 5-business-day furnisher notice and results, deletion of unverifiable information
- [15 U.S.C. 1681m: Requirements on users of consumer reports](https://www.law.cornell.edu/uscode/text/15/1681m), adverse action notice contents, credit score disclosure, free report within 60 days, dispute rights
- [15 U.S.C. 1681s-2: Responsibilities of furnishers of information](https://www.law.cornell.edu/uscode/text/15/1681s-2), accuracy, correction, dispute flags and investigations
- [24 CFR 100.500: Discriminatory effect prohibited](https://www.law.cornell.edu/cfr/text/24/100.500), the definition of discriminatory effect, legally sufficient justification and the three-step burden
- [Federal Register: HUD's Implementation of the Fair Housing Act's Disparate Impact Standard (91 FR 1475)](https://www.govinfo.gov/content/pkg/FR-2026-01-14/html/2026-00590.htm), the January 14, 2026 proposal to remove 100.500 and its rationale
- [Federal Register: Supplemental proposal and reopened comment period (91 FR 51416)](https://www.govinfo.gov/content/pkg/FR-2026-08-10/html/2026-16228.htm), Title VI amendments and comments through October 9, 2026
- [Federal Register: Notification of Withdrawal of FHEO Guidance Documents (91 FR 17291)](https://www.govinfo.gov/content/pkg/FR-2026-04-06/html/2026-06624.htm), eight documents withdrawn effective September 17, 2025, including FHEO-2020-01 and the 2022 criminal records implementation memo
- [Federal Register: Notice of the Withdrawal of OGC Guidance Documents (91 FR 44867)](https://www.govinfo.gov/content/pkg/FR-2026-07-17/html/2026-14432.htm), thirteen documents withdrawn effective September 25, 2025, including the April 4, 2016 criminal records guidance and the November 2024 source of income guidance
- [California Civil Code 1950.6](https://california.public.law/codes/civil_code_section_1950.6), the $30 CPI-adjusted fee cap, no fee without an available unit, receipts, report copies, refunds and reusable reports
- [New York Real Property Law 238-a](https://www.nysenate.gov/legislation/laws/RPP/238-A), the $20 or actual cost limit, the 30-day report waiver and the copy and receipt requirement
- [Colorado HB23-1099: Portable Screening Report for Residential Leases](https://leg.colorado.gov/bills/hb23-1099), acceptance, contents, the 30-day age limit, fee prohibition, exemption and disclosure; signed May 4, 2023, effective August 7, 2023
- [RCW 19.375.020: Enrollment, disclosure, and retention of biometric identifiers](https://app.leg.wa.gov/rcw/default.aspx?cite=19.375.020), Washington's notice and consent, disclosure limits and retention

**Agency guidance and reports**

- [FTC: Texas company will pay $3 million to settle FTC charges that it failed to meet accuracy requirements for its tenant screening reports](https://www.ftc.gov/node/45771), the October 16, 2018 RealPage settlement, matching practices, period and court
- [FTC Business Blog: $3 million FCRA settlement puts tenant background screening at the forefront](https://www.ftc.gov/node/54336), the soft-matching rules in detail
- [FTC: Using Consumer Reports: What Landlords Need to Know](https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-landlords-need-know), permissible purpose, co-signer and larger deposit as adverse action, notice contents, scores as consumer reports, disposal, furnisher duties
- [CFPB: Tenant Background Checks Market (November 2022, PDF)](https://files.consumerfinance.gov/f/documents/cfpb_tenant-background-checks-market_report_2022-11.pdf), eviction record errors, automated court record retrieval, missing rental payment history, application fees
- [Hudson Cook: CFPB's withdrawal of interpretive guidance and its impact on the rental screening industry](https://hudsoncook.com/article/regulatory-reversal-cfpb’s-withdrawal-of-interpretive-guidance-and-its-impact-on-the-rental-screening-industry/), the withdrawn name-only matching, background screening and permissible purpose advisory opinions
- [HUD: HUD Issues Fair Housing Act Guidance on Applications of Artificial Intelligence (May 2, 2024)](https://archives.hud.gov/news/2024/pr24-098.cfm), the tenant screening guidance and shared responsibility of providers and screening companies
- [TechEquity: Unpacking HUD's new guidance on algorithmic tenant screening](https://techequity.us/2024/05/29/unpacking-huds-new-guidance-on-algorithmic-tenant-screening), the guidance's recommendations to housing providers
- [NLIHC: HUD Secretary Turner issues letter on criminal screening](https://nlihc.org/resource/hud-secretary-turner-issues-letter-encouraging-phas-adopt-more-restrictive-screening), the November 25, 2025 rescission of Notice PIH 2015-19, the 2016 OGC guidance and the 2022 FHEO memo
- [HUD: HUD Issues Guidance on Reasonable Accommodations Relating to Assistance Animals (January 28, 2020)](https://archives.hud.gov/news/2020/pr20-013.cfm), FHEO-2020-01's documentation practices, online certificates and unusual animals
- [NYC Commission on Human Rights: Fair Chance Housing](https://www.nyc.gov/site/cchr/media/fair-chance-housing-campaign.page), the January 1, 2025 start, process, lookbacks, never-considered records, assessment factors and exemptions
- [Cook County Commission on Human Rights: Just Housing Amendment](https://www.cookcountyil.gov/content/just-housing-amendment-human-rights-ordinance), effective dates, three-year lookback, prequalification, notice and dispute timelines
- [California Civil Rights Department: Housing](https://calcivilrights.ca.gov/housing/), criminal history limits and source of income protection
- [California Civil Rights Department: Fair Housing and Criminal History Fact Sheet (PDF)](https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2022/11/Fair-Housing-and-Criminal-History-Fact-Sheet_ENG.pdf), excluded records, mitigating information, financial qualifications first

**Cases**

- [Ninth Circuit: Yim v. City of Seattle, No. 21-35567 (PDF)](https://cdn.ca9.uscourts.gov/datastore/opinions/2023/03/21/21-35567.pdf), the inquiry provision struck under the First Amendment, the adverse action provision upheld, remand on severability
- [Cohen Milstein: Louis et al. v. SafeRent Solutions](https://cohenmilstein.com/case-study/louis-et-al-v-saferent-solutions-et-al), case number, court, $2.275 million settlement, final approval on November 20, 2024, relief for voucher holders

**Reference**

- [Poverty & Race Research Action Council: State, Local, and Federal Laws Barring Source of Income Discrimination (PDF)](https://www.prrac.org/pdf/AppendixB.pdf), the state list and weakened laws, updated March 2026
- [Wikipedia: Biometric Information Privacy Act](https://en.wikipedia.org/wiki/Biometric_Information_Privacy_Act), BIPA's 2008 enactment, consent and destruction duties, private right of action and damages, and the Texas and Washington analogues

**Filings**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), resident screening among Embedded Technology Solutions revenue

**In practice**

- [Entrata: ResidentVerify](https://www.entrata.com/products/residentverify), screening in the application, configurable criteria, document fraud, synthetic identity, ID scan and liveness, bank and payroll income, international credit, centralized disputes
- [Entrata: PreciseID](https://www.entrata.com/products/preciseid), passive identity verification in the guest card flow, step-up checks and biometrics
- [Entrata: Nova Credit's Credit Passport integration](https://www.entrata.com/press/entrata-integrates-nova-credits-credit-passport-to-expand-housing-access-for-international-renters), international credit from 16 countries (April 15, 2025)
- [RealPage: Resident Screening](https://www.realpage.com/apartment-marketing/resident-screening/), bureaus, criminal and eviction data, the landlord-contributed rental payment database, layered identity checks, AI screening as decision support
- [AppFolio: Tenant screening](https://www.appfolio.com/tenant-screening), FolioScreen Trusted Renter, income and ID verification partners, AI fraud detection, automatic adverse action notices
- [Buildium: Tenant screening](https://www.buildium.com/features/tenant-screening/), TransUnion-powered credit, criminal and eviction reports and per-screen pricing
- [Snappt](https://snappt.com/), document metadata analysis, payroll-connected income, biometric ID checks and rental history verification
- [Nova Credit](https://www.novacredit.com/), consumer-permissioned data and its status as a consumer reporting agency
- [PetScreening](https://www.petscreening.com/), pet policy management and assistance animal verification
- [OurPetPolicy](https://www.ourpetpolicy.com/), assistance animal verification and pet records
