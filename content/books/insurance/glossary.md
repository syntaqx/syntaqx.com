+++
title = "Insurance Glossary"
nav_title = "Glossary"
description = "Insurance terms by part: the business, regulation, distribution, rating, policy admin, claims, reinsurance, personal, commercial, comp, life and the platform."
category = "Insurance Industry"
order = 2799
part = "Reference"
tags = ["insurance", "property-and-casualty", "life-insurance", "glossary", "reference"]
+++

Insurance borrows its words from contract law, accounting, actuarial science and a century of state regulation, and the same word shifts with context: a reserve is an adjuster's estimate on one claim and an actuary's estimate for a whole accident year, an exposure is a claimant against a coverage in a claims system and the unit premium is charged on (a car-year, $100 of payroll) in a rating manual, a binder is a temporary contract on one desk and an MGA's authority on another, and a premium is written, earned, billed and collected at four different times. Entries are grouped by the part of the volume that explains them, alphabetized within each group, and each is one line and a link to the chapter that owns the idea; a word with two meanings appears once per meaning, qualified. Terms the [Payments](/books/payments/glossary) and [Banking & Lending](/books/banking-and-lending/glossary) glossaries already define keep their definitions. The volume's own names for the core records (insurer, insurer authority, party, party role, producer, producer license, appointment, product, form, rate table, submission, quote, policy, policy term, policy transaction, policy version, risk, coverage, premium entry, billing account, invoice, installment, payment, commission, claim, exposure, reserve, claim payment, recovery, claim task, reinsurance contract, cession, document, notice, regulatory filing, complaint) are the ones in [The Core Data Model](/books/insurance/insurance-business#the-core-data-model).

## The Business

- **Admitted insurer:** an insurer holding a certificate of authority in a state, filing its rates and forms there and covered by the state's guaranty association ([The Insurance Business](/books/insurance/insurance-business#who-s-who)).
- **Combined ratio:** the loss and LAE ratio plus the expense ratio; below 100% means an underwriting profit before investment income ([The Insurance Business](/books/insurance/insurance-business#the-ratios)).
- **Coverage:** one insuring agreement on a policy version and risk, with its limits, deductibles, premium and forms ([The Insurance Business](/books/insurance/insurance-business#the-core-data-model)).
- **Earned premium:** the part of written premium for coverage already provided, pro rata by time unless the earning rule says otherwise ([The Insurance Business](/books/insurance/insurance-business#written-earned-and-unearned)).
- **Expense ratio:** underwriting expenses over written premium ([The Insurance Business](/books/insurance/insurance-business#the-ratios)).
- **Float:** money an insurer holds for others, chiefly unearned premium and loss reserves, invested until it is paid out ([The Insurance Business](/books/insurance/insurance-business#float-surplus-and-leverage)).
- **Insurer authority:** an insurer's certificate of authority or surplus lines eligibility in one state, for named lines, effective-dated ([The Insurance Business](/books/insurance/insurance-business#the-core-data-model)).
- **Loss ratio:** losses incurred over earned premium ([The Insurance Business](/books/insurance/insurance-business#the-ratios)).
- **Named insured:** the party who owns a P&C policy and to whom notices are sent ([The Insurance Business](/books/insurance/insurance-business#who-s-who)).
- **Policy transaction:** a change to a policy (new business, endorsement, cancellation, reinstatement, renewal, nonrenewal, audit, rewrite) with its effective date, processed time and written premium change; the only way a policy changes ([The Insurance Business](/books/insurance/insurance-business#the-core-data-model)).
- **Policy version:** the policy as of an effective date range, produced by a policy transaction, with effective and recorded time ([The Insurance Business](/books/insurance/insurance-business#the-core-data-model)).
- **Policyholders' surplus:** an insurer's statutory capital, assets less liabilities on the statutory balance sheet ([The Insurance Business](/books/insurance/insurance-business#float-surplus-and-leverage)).
- **Premium entry:** a written premium, tax, fee or surcharge amount from one policy transaction, with its earning window, from which earned and unearned premium are derived ([The Insurance Business](/books/insurance/insurance-business#the-core-data-model)).
- **Premium-to-surplus ratio:** net premiums written over policyholders' surplus, a measure of underwriting leverage ([The Insurance Business](/books/insurance/insurance-business#float-surplus-and-leverage)).
- **Pro rata:** returning or charging premium in proportion to the time remaining or covered ([The Insurance Business](/books/insurance/insurance-business#written-earned-and-unearned)).
- **Risk:** a thing or exposure insured, typed by line (vehicle, driver, dwelling, location, class code exposure, insured life, covered product) ([The Insurance Business](/books/insurance/insurance-business#the-core-data-model)).
- **Short rate:** a return premium table that keeps more than pro rata when the insured cancels, limited by some states ([The Insurance Business](/books/insurance/insurance-business#written-earned-and-unearned)).
- **Surplus lines insurer:** a non-admitted insurer eligible to write risks placed through a licensed surplus lines broker, on its own rates and forms, without guaranty fund coverage ([The Insurance Business](/books/insurance/insurance-business#who-s-who)).
- **Unearned premium reserve:** the liability for written premium not yet earned ([The Insurance Business](/books/insurance/insurance-business#written-earned-and-unearned)).
- **Written premium:** the premium recorded when a policy transaction is processed, for the coverage it adds or removes ([The Insurance Business](/books/insurance/insurance-business#written-earned-and-unearned)).

## Distribution

- **Producer:** a licensed agent, agency, broker or MGA that sells insurance, identified by its National Producer Number ([The Insurance Business](/books/insurance/insurance-business#who-s-who)).

## Claims

- **A&O (adjusting and other):** loss adjustment expense not tied to a specific claim's defense, chiefly the cost of the claims operation ([The Insurance Business](/books/insurance/insurance-business#where-the-premium-dollar-goes)).
- **DCC (defense and cost containment):** loss adjustment expense tied to specific claims, such as defense counsel and experts ([The Insurance Business](/books/insurance/insurance-business#where-the-premium-dollar-goes)).
- **Exposure (claims):** one claimant against one coverage on a claim, the unit reserves and payments attach to ([The Insurance Business](/books/insurance/insurance-business#the-core-data-model)).
- **LAE (loss adjustment expense):** the cost of investigating, defending and settling claims, split into DCC and A&O ([The Insurance Business](/books/insurance/insurance-business#where-the-premium-dollar-goes)).

## References

**Reference**

- [NAIC: 2025 Annual Property and Casualty and Title Insurance Industries Analysis Report (PDF)](https://content.naic.org/sites/default/files/2025-annual-property-and-casualty-and-title-insurance-industries-analysis-report.pdf), how the industry's loss, expense and combined ratios are defined and reported
- [Fla. Admin. Code 69O-170.010](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-69O-170-010), pro rata and short-rate return premium
- [Guidewire: Overview of modifying jobs (PolicyCenter Cloud API)](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/123-PCpolicies/00-overview-of-modifying-jobs/c_overview_of_modifying_jobs.html), policy transactions as the only way a policy changes
