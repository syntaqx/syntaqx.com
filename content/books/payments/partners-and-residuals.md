+++
title = "Partners, ISOs & Residuals"
nav_title = "Partners & Residuals"
description = "Selling through ISOs, agents, software platforms and banks: network registration, buy rates and splits, clawbacks, and a residual engine partners can audit."
category = "Payments Industry"
order = 1431
part = "Running a Provider"
tags = ["payments", "residuals", "iso", "partners", "commissions"]
+++

Few providers sign most of their merchants themselves. The rest arrive through someone else: an independent sales organization (ISO) with a sales floor, a lone agent with a book of restaurants, a software platform that embeds payments, a bank that offers acceptance to its business customers. Each of them is paid, usually monthly, from the margin on the merchants it brought, and that payment is the **residual**: residual because it keeps arriving for as long as the merchant keeps processing.

Selling through others has two halves, and a provider has to build both. The rule half decides who may sell at all: the networks require the acquirer to register most of these parties, the sponsor bank underwrites them as it underwrites merchants, and the acquirer stays liable for what they do. The money half is a contract per partner, with buy rates, splits, minimums and clawbacks, and an engine that turns a month of ledger entries into a statement every partner in the chain can check line by line.

[Payments for Software Platforms](/books/payments/software-platforms) covers the platform's side of this: fee overrides down a tenant tree, the cost and price at each level, and checking the provider's residual statement ([Overrides Down the Tree](/books/payments/software-platforms#overrides-down-the-tree)). [Revenue and Cost](/books/payments/payments-metrics#revenue-and-cost) compares how providers publish the residual formula. This chapter is the provider's side: the channels, what the networks and banks ask of them, how the contracts pay, and the residual engine that computes, pays, reports and defends every line.

## The Channels

The partner types overlap, and one company can be several at once, but each answers three questions differently: what it sells, what it owns when the relationship ends, and what it pays for when a merchant goes bad.

| Channel | What it sells | What it owns | What it's liable for |
| --- | --- | --- | --- |
| **ISO** | Merchant accounts for an acquirer or processor: solicitation, applications, often support, statements and terminals | Its residual stream; the merchant relationship only if the contract says so, and bank guidance says it shouldn't | Usually nothing for merchant losses, unless it takes them on for better economics |
| **Sub-ISO or independent agent** | The same, under an ISO's contract and pricing | A share of its ISO's residual on the merchants it signed, sometimes vested | Whatever its ISO passes down |
| **Referral partner** | An introduction; the provider underwrites and contracts | A referral fee or a small share | Nothing |
| **ISV reseller** | Payments inside its software, with onboarding handed to the provider | Its software customers; the payments contract is the provider's | Usually nothing, unless the contract shifts it |
| **Payfac-as-a-service platform** | Payments under its own brand on the provider's payfac registration | The merchant relationship and experience | What the contract assigns, often first-loss on its merchants |
| **Bank** | Acceptance to its own business customers, as an agent or a referrer | The banking relationship | With liability, the losses on merchants it indemnifies; without, nothing |

The software rungs are the same ladder [Four Ways In](/books/payments/software-platforms#four-ways-in) and [Pick a Model, Pick a Risk](/books/payments/becoming-a-payment-provider#pick-a-model-pick-a-risk) describe. The older channels are worth a closer look, because their vocabulary is the one residual contracts are written in:

- **ISOs.** Mastercard's rules define ISO program service as cardholder, merchant or account holder solicitation, including application processing, and list what else falls under it: customer service, statement preparation without access to account or transaction data, merchant education and training, and terminal deployment. The OCC's merchant processing booklet, written for bank examiners, describes the same role and expands the industry's paired label as "independent sales organizations or membership service providers (ISO/MSP)". It's the label providers still use in their footers: Payabli is "a registered ISO/MSP of Merrick Bank" beside its payfac registrations ([The Sponsor Bank](/books/payments/becoming-a-payment-provider#the-sponsor-bank)).
- **Sub-ISOs and agents.** Below an ISO sit smaller ISOs and individual agents who sell on its contract and are paid from its residual. The networks' rules don't contemplate them as a tier: Mastercard forbids a service provider to subcontract or transfer any right in providing program service, and lets it work only through its own employees or those of another service provider registered for the same acquirer. Under that rule (7.4), a sub-ISO soliciting merchants for an acquirer is either registered for that acquirer itself or is the ISO's employee. Which side of that line a commission-only agent falls on is the acquirer's call, so ask your sponsor before the first sub-agent signs.
- **Bank channels.** The OCC booklet describes **agent banks**: usually community banks that don't acquire themselves and send their business customers to an acquirer. An agent bank that indemnifies the acquirer for a merchant's losses is an agent bank with liability; one that only refers is an agent bank without liability, and the acquirer "may pay the referring bank a fee for brokering the merchant relationship". The modern form embeds the provider in the bank's own product: in February 2026 Huntington announced "fully integrated embedded payment and banking capabilities into its online banking portal" for its B2B customers, built on Payabli's APIs and interfaces. Huntington is also one of the two banks that sponsor Payabli's payfac registration, so the bank there is both the channel and the sponsor.

"What it owns" is the column that decides the economics later. Whoever owns the merchant relationship decides whether a departing partner can move its merchants to a competitor, whether its residuals survive its departure, and what a portfolio of merchants is worth when someone wants to buy it ([Ownership, Vesting and Portfolio Sales](#ownership-vesting-and-portfolio-sales)).

My rule: the channel is a property of the relationship, not of the merchant. A merchant belongs to exactly one selling chain at a time, recorded with effective dates, and a merchant that changes agents changes chains on a date, never retroactively.

## Registration and Oversight

A partner that solicits merchants acts on the acquirer's behalf, so the networks hold the acquirer responsible for it and require the acquirer to tell them who it is. The details differ by network; the shape is the same: a direct contract with the acquirer, registration before any work, diligence on the partner and its principals, annual review, prompt notice of changes, and liability that stays with the acquirer whatever the contract says.

### Visa: Third Party Agents

Visa's term is **Third Party Agent**: "An entity, not defined as a VisaNet Processor or Visa Scheme Processor, that provides payment-related services, directly or indirectly, to a Member and/or its Merchants or Sponsored Merchants or their agents." The April 2026 Visa Core Rules set the obligations:

- **A direct contract.** A Third Party Agent "must have a direct written contract with a Member" (1.9.8.5), and one that solicits merchants needs a contract executed by a senior officer of the member, requiring PCI DSS compliance and letting the member terminate it if the agent engages in the conduct for which Visa may prohibit it, or the member becomes insolvent (10.2.2.2).
- **Registration first.** The member registers the agent through Visa's Program Request Management application and regional forms, and "Registration must be completed before the performance of any contracted services or Transaction activity" (1.9.8.6). An agent working only for members that own and control at least 25% of it is exempt, but the exemption never covers payment facilitators (payfacs), marketplaces or the other listed types. An agent engaged by a merchant is registered by that merchant's acquirer, separately by each acquirer (1.9.8.7).
- **Identifiers, since October 24, 2026.** In the US and Canada, registration now includes the Numeric IDs associated with the agent and the issuing identifiers, acquiring identifiers, BINs and account ranges it uses on the member's behalf, kept "accurate, complete, and current" and reviewed annually, after any change, or on Visa's request (1.9.8.6, in effect as of October 2026). For a provider with agents, that's a registry to maintain, not a form to file once.
- **Diligence before signing.** A senior officer reviews the documentation, the member determines the agent is financially responsible, and runs a background investigation of its principals for "significant derogatory information"; approval "must not be based solely on any purported limitation of the Member's financial liability" in the contract (10.2.2.1). An on-site inspection of the agent's business, including its sales materials and controls, comes before registration (10.2.2.3), and the member reviews each agent annually against the regional due diligence standards (10.2.2.4).
- **Control stays with the member.** The member must "Control the approval and review of Merchants, approval of Cardholder applications, and establishment of Merchant fees", and "Accept responsibility for any fees incurred and all losses caused by its Third Party Agent" (10.2.2.6). The agent's marketing needs the member's approval, any merchant agreement is between the member and the merchant, and the agent presents itself under the trade name registered with the member (10.2.2.9).
- **Changes and endings.** A change in an agent's principals, ownership or contract, including termination, is reported within 5 business days (10.2.2.5), and after a relationship ends the member keeps the agent's due diligence file, with the reason for discontinuance, for at least 2 years (10.2.2.6). Visa may permanently prohibit an agent and its principals for good cause, fraud among them (10.2.2.11).

When a member fails these responsibilities, Visa assigns the loss first to the member whose agent caused it, then to its sponsor, then to the licensees of the BINs or acquiring identifiers used (1.9.8.8). The agent's contract can move money between the member and the agent afterward; it can't move the member's liability to Visa.

### Mastercard: Service Providers

Mastercard registers the same parties as **service providers**, with ISO as one category among many, under chapter 7 of the Mastercard Rules (2 June 2026):

- **The acquirer stays in charge.** The customer (the acquirer) "must at all times be entirely responsible for and must manage, direct, and control all aspects" of the program its service providers perform, and must not limit that responsibility (7.2.1). A written program service agreement comes before any work, and it can't contain a provision that limits the acquirer's responsibility (7.2.3).
- **Hands off the money.** A service provider other than a payfac "must not have access to any account for funds due to a Merchant or withheld from a Merchant for chargebacks" (7.3). If the ISO is a party to the merchant agreement, the acquirer "must approve, in advance, any fee payable to or obligation of the Merchant" (7.6.1), and discount rates are collected by the acquirer, not the service provider (7.6.2). An ISO prices merchants; it never touches their funds.
- **Registration.** The acquirer registers each service provider through the My Company Manager application on Mastercard Connect, supplies what Mastercard asks within 30 days, validates its own responsibilities at registration and every calendar year, and needs Mastercard's written confirmation before using the provider. Mastercard charges an initial registration fee and an annual renewal, and a provider working for several acquirers is registered separately by each (7.10). Failing the registration rules costs up to USD 25,000 per 30-day period (7.10).
- **In every message.** An acquirer using an ISO populates the ISO field with its Independent Sales Organization ID in all transaction messages for that ISO's merchants (7.6.6), so the network can tie volume to the partner that sold it.
- **Endings.** When an acquirer terminates a service provider, it reports the date and reasons through My Company Manager within one week of the decision (7.13), and Mastercard can bar a service provider, its owners or its employees from performing program service (7.12).

### What the Sponsor Bank Asks

The networks set the floor; the sponsor bank's examiners set the practice. The OCC's merchant processing booklet tells banks to "check the background of each principal of an ISO/MSP", analyze the financial capacity of the ISO and its principals to absorb losses, and notes that "many acquirers obtain cash deposits from the ISO/MSP to support the contractual arrangement". Its examination procedures list what an ISO contract should do, and it reads like a term sheet for everything in [The Economics](#the-economics):

- Tie fees to performance and adherence to the contract, such as the number and quality of merchants, sales volume or chargeback activity.
- Define responsibility for fraud and chargeback losses.
- Require security deposits when the ISO's finances are weak or its merchants are poor.
- Include remedies if the ISO fails to perform, "including indemnity, early termination rights, and delayed payment of residuals".
- State the criteria for accepting merchants, specify "that the bank owns the merchant relationships", and control the future use and solicitation of those merchants.

The interagency guidance on third-party relationships (OCC Bulletin 2023-17, issued June 6, 2023 with the Federal Reserve and the FDIC) is the general frame the bank applies to every partner it relies on, and an ISO selling under the bank's network identifiers is one. [Living With a Sponsor Bank](/books/payments/becoming-a-payment-provider#living-with-a-sponsor-bank) covers the rest of the relationship.

### Principals, MATCH and Terminated Agents

The people behind a partner matter more than its legal entity, because a terminated agent can reappear under a new name next month.

- **MATCH Pro checks merchants and their owners.** Mastercard's MATCH Pro holds acquirer-reported records of terminated merchants "(and their owners)", and searches by principal owner name among other fields; an acquirer must inquire before signing its own merchants and its payfacs' sponsored merchants ([Underwriting and Risk Tiers](/books/payments/merchant-onboarding#underwriting-and-risk-tiers)). It lists merchants, not agents. An agent's principal who owned a merchant terminated for cause will appear; an agent fired for misrepresenting rates won't.
- **The acquirer's records include the agents.** Mastercard's screening standards list what an acquirer retains about each merchant investigation, for two years after the merchant agreement ends, and that includes the "Signed Service Provider contract, including the name of agents involved in the due diligence process" and "Acquirer due diligence records concerning the Service Provider and its agents". Who sold each merchant is part of the merchant's file.
- **Visa lists terminated agents in some regions.** The Visa Merchant Screening Service records merchants and Third Party Agents whose contracts were terminated for cause, in the Asia-Pacific, CEMEA and Europe regions; the US has no equivalent network list for agents in the rules I read.

My rule: keep your own terminated-partner list with the principals on it, screen every new partner's principals against it, against MATCH Pro (directly as an authorized user or through your acquirer) and against sanctions lists, and store each result with the date and the list version. Re-screen when principals change, which Visa's five-day notice requires you to know about anyway.

## The Economics

A residual contract answers four questions: what the partner pays for each merchant's processing (its buy rate), how the margin above that is divided, what can reduce the payment (minimums, holdbacks, clawbacks), and what happens to the stream when the relationship ends.

### Buy Rates and Schedule A

In ISO and agent contracts the price list is traditionally an attachment called **Schedule A**. The Green Sheet, the ISO trade press, defines it from the agent's side: "Schedule A is the schedule of costs the ISO is charging you to place a merchant's processing business with them", and "These costs don't necessarily equal the ISO's costs unless the ISO indicates that your cost is the pass-through cost." A schedule has the same lines a merchant's pricing has ([Pricing Models](/books/payments/interchange-and-pricing#pricing-models)):

- **Basis points on volume,** by card type and channel, over pass-through interchange and network fees.
- **Per-item fees:** per authorization, per transaction, per batch, per chargeback, per retrieval.
- **Monthly and annual fees** per merchant account: statements, PCI programs, gateway access.

The same article warns agents that "Many agents focus completely on negotiating a higher revenue split and ignore the Schedule A", and that "some ISOs will indicate an item is passthrough but will, in fact, build in some margin for themselves". For the engine, that means every line on a schedule carries a flag: pass-through at actual cost, or a fixed buy rate. The two are computed differently and disputed differently.

### Markup or Revenue Share

Above the buy rate, contracts pay in one of two ways, often mixed in one agreement:

```text
markup:          residual = merchant fees - buy-rate cost
revenue share:   residual = (merchant fees - buy-rate cost) x split
```

Under **markup**, the partner keeps everything it prices above its buy rate; it's the model of [the tree in Payments for Software Platforms](/books/payments/software-platforms#overrides-down-the-tree), where each level's price to the level below is the next level's cost. Under **revenue share**, the provider keeps a share of the margin too, and the split is the negotiated number. The published platform formulas are revenue shares: Moov's residual is net income times the revenue share, and Tilled's commission is merchant revenue minus platform cost times the revenue share, per fee type ([Revenue and Cost](/books/payments/payments-metrics#revenue-and-cost)). In ISO contracts the split commonly varies by merchant: Priority Technology's 10-K describes commissions as "a percentage of the net revenues generated from the Company's merchant customers", with percentages that "vary based on the program type and transaction volume of each merchant".

Two consequences for the engine. Compute per fee line, not per merchant: basis-point lines and per-item lines have different buy rates, and a partner who disputes its chargeback fee margin needs that line on its own. And compute the margin before applying the split, every time, so that a split change never has to touch the cost side.

### Splits Up a Tree

A partner tree is the same shape as a platform's tenant tree, with money flowing the other way. Each level buys at its parent's sell rate, sells to the level below, and keeps the difference; the residuals of every level plus the cost of acceptance add up exactly to what the merchant paid.

![An indented tree of five levels for one $100.00 card payment, with three columns: buys at, sells at, and keeps. The provider buys at cost and sells at cost plus 0.15% plus $0.05, keeping $0.20. The ISO buys at that rate and sells at cost plus 0.35% plus $0.08, keeping $0.23. The sub-ISO buys at that and sells at cost plus 0.50% plus $0.10, keeping $0.17. The agent buys at that and sells to the merchant at 2.90% plus $0.30, keeping $0.55. The merchant pays $3.20. Below the table, the cost of acceptance is $2.05 for interchange, network and processing, and an accented line reads $2.05 plus $0.20 plus $0.23 plus $0.17 plus $0.55 equals $3.20, the merchant's fee to the cent. The kept amounts are accented.](/diagrams/pm-partner-residuals.svg "Each level's buy rate is its parent's sell rate, and it keeps the difference. The values are illustrative; the invariant isn't: every level's share plus the cost of acceptance equals the merchant's fee to the cent.")

With revenue shares instead of markups, the same tree divides a margin instead of stacking prices: the provider pays the ISO its split of the margin over the ISO's buy rate, and the ISO pays its sub-ISO a split of what the ISO received, or of the margin over a sub-ISO buy rate the ISO set. Which one a contract means is the most common source of residual disputes in a tree, so the agreement has to say, in data, what each level's share is computed from.

My rule: the provider computes every level of the tree in one run from the same ledger lines, even when it only pays the top level and the ISO pays the rest. A sub-agent's statement that the ISO recomputes from the provider's summary will drift, and a provider that can show each level's line from its own records settles the argument in minutes.

### Minimums, Reserves and Holdbacks

Several terms reduce or delay what the formula produces, and each needs its own line on the statement so the partner can see why the payment is smaller than the margin:

- **Minimums.** The Green Sheet describes ISOs that "require that you board a certain number of deals each month" or "maintain a billing or residual minimum on your portfolio", and "When you don't meet this threshold, your residuals will not be paid." The engine evaluates the minimum per period and records the shortfall as a line, never as a silent zero.
- **Reserves.** The OCC booklet has banks require security deposits from weak ISOs, and the same logic applies down the tree: a share of each residual held back until a balance is reached, released on a schedule, the partner-level version of a merchant reserve ([Exposure and Reserves](/books/payments/merchant-onboarding#exposure-and-reserves)).
- **Holdbacks against debts.** Priority's 10-K notes that under its agreements with ISOs it borrowed money to, it "preserves the right to hold back residual payments due to the ISOs and to apply such residuals against future payments due to the Company". A residual is the natural place to collect anything a partner owes.

### Clawbacks for Merchant Losses

Most partners don't carry merchant losses. The Green Sheet's ISO-rights column says "Historically, most ISOs have not assumed liability for merchant chargebacks, fines and security breaches", while an ISO with "enough underwriting expertise and financial ability" can negotiate to take them; Priority describes "partner programs in which the ISOs assume liability for these charges or losses". Where the contract assigns losses, they come back through the residual:

- **A merchant's unrecovered loss.** A merchant that leaves a negative balance the provider can't collect ([Negative Balances](/books/payments/payouts-and-settlement#negative-balances), [Clawbacks](/books/payments/payouts-and-settlement#clawbacks)) becomes a charge to the liable partner, at the share its agreement sets, when the provider writes the receivable off, not when it first goes negative.
- **Chargebacks and fines** the partner is liable for post as their own lines against the merchant and the dispute that caused them ([Disputes in the Ledger](/books/payments/disputes-and-chargebacks#disputes-in-the-ledger)).
- **Negative residuals.** When fees don't cover costs, the formula goes negative on its own. Finix says residuals "may be negative if your Merchant Fees are not high enough to cover the Finix Costs", Moov debits the partner's wallet, and Tilled shares a payment link to collect.

My rule: a clawback is a separate line that references the loss event and the agreement term that assigns it, never a reduction hidden inside a fee line. A negative period total carries forward as a receivable from the partner, offset against later residuals first and invoiced only if the relationship ends.

### Ownership, Vesting and Portfolio Sales

The end of a relationship is where residual contracts are actually tested:

- **Who owns the merchants.** The OCC wants the ISO contract to "specify that the bank owns the merchant relationships" and to "control the future use and solicitation of merchants". Agents negotiate the other way: the Green Sheet's column describes residuals paid "so long as the ISO is not in material and uncured default", with "sudden death" clauses for an "ISO's intentional re-solicitation of merchants that is not remedied". Termination rules belong in the agreement as data: which breaches stop residuals, whether stopping is immediate or after a cure period, and whether it covers all merchants or only those affected.
- **Vesting.** The word has two meanings in this business. In the Green Sheet's usage, it's meeting the minimums that make residuals payable. In Heartland Payment Systems' filings, it's ownership that survives employment: Heartland considered a salesperson vested "once they have established merchant relationships that generate on average the equivalent of $10,000 of monthly gross margin for a rolling 90 day period", and vested status "entitles the salesperson to his or her residual commissions for as long as the merchant processes with us, even if the salesperson is no longer employed by us". An agreement records which meaning it uses, the test, and the date each partner passed it.
- **Buyouts and portfolio sales.** A residual stream is an asset, and it's bought and sold. Heartland called its salespeople's owned commissions "portfolio equity" and accrued the cost of buying out all vested salespeople from the prior twelve months' gross margin on their merchants, the owned commission rate, and "the fixed buyout multiple of 2.5 times the commissions". Priority capitalizes residual buyouts, the "Surrender of rights to receive commissions by ISOs", as intangible assets amortized over 3 to 9 years, and Shift4 told the SEC that residual buyouts and merchant portfolio purchases are commonly treated the same way across the industry. For the engine, a sale is a change of payee on a set of merchants from a date; for the networks, it's a change the acquirer reports, since Visa requires notice of a change in an agent's ownership or contract within 5 business days and Mastercard of a service provider's transfer of ownership or control.

## The Residual Engine

The engine's job is narrow and unforgiving: given a closed month of ledger entries and the agreements in force, produce for every partner a set of lines that sums to its payment, where every line can be recomputed by anyone, later, to the same cent. Priority's auditors describe testing exactly that: they "compared the pricing terms included in the calculation to the respective ISO contract", "recalculated the related expense and accrual", agreed the payment to the cash disbursement, and agreed each sampled merchant's monthly volumes to the processor statements. Their report calls residual commissions complex to audit because of "the non-standard nature of the pricing terms within the ISO contracts, the volume of contracts, the volume of transactions processed each month". Build for that audit.

### Inputs From the Ledger

Residuals are computed from ledger entries, never from a reporting copy of fees. Each payment already posts its merchant fee to `platform_revenue` and its costs to `processing_costs` ([A Provider's Chart of Accounts](/books/payments/ledger-and-reconciliation#a-provider-s-chart-of-accounts)), and the stamped fee schedule records which line priced what ([Resolving at Scale](/books/payments/software-platforms#resolving-at-scale)). The engine reads, per payment and fee line:

- **Revenue:** the merchant fee as charged, including later corrections and refunds of fees.
- **Cost:** for pass-through lines, the actual interchange and network fees from the settlement files; for buy-rate lines, the partner's buy rate applied to the same volume and count, which is a computed number, not a ledger cost.
- **The selling chain:** which partners, at which levels, were assigned to the merchant on the payment's date.

Decide once which date assigns a payment to a period and a chain (capture, settlement or ledger posting date), write it in the agreement, and never mix them. Settlement date is the usual choice because that's when the actual costs are known.

### Effective-Dated Agreements

An agreement is rules as data with history, the same discipline as the merchant's fee schedule ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows), [Changing Prices Without Losing the Record](/books/payments/software-platforms#changing-prices-without-losing-the-record)):

- **Every term is a versioned row:** the buy rate per fee line, the split, the model, minimums, holdback, liability share, vesting test, and which level's share the split applies to.
- **A change is a change set** with an author, an approver other than the author, a reason and the signed amendment it implements. A split raised for one partner is money moved from the provider to that partner on every future payment, and it deserves the same approval as a price below cost.
- **Retroactive changes are explicit.** A renegotiated split effective last month is recorded with its `valid_during` in the past and its `recorded_during` now, and produces adjustment lines in the current run, never a rewritten old statement.

### The Monthly Run

A residual run is a job over one closed period, with states the provider can show a partner and an auditor:

1. **Wait for the ledger close.** The run starts after [the month-end close](/books/payments/ledger-and-reconciliation#closing-the-day-and-the-month) locks the period, so the inputs can't change under it.
2. **Calculate.** For each payment and fee line, resolve the chain and the agreements in force, compute each level's margin and share, and write lines with every input. Then the period lines: minimums, holdbacks, reserve releases, clawbacks, carried-forward balances.
3. **Check.** Every payment's level shares plus its cost equal its merchant fee, to the cent. The run's total residual expense ties to the accrual finance booked. Any partner whose total moved more than a threshold from last month goes to review with the merchants that moved it.
4. **Approve and publish.** A person other than the run's operator approves; statements go out with the summary and the line detail.
5. **Pay and post.** Payments post as ledger transactions against a residuals payable, and the run records each payout.

**Late costs are adjustments, not reruns.** Networks bill some fees up to two months after the transaction, and interchange-plus pricing trues up estimates when the settlement files arrive ([A Pricing Engine](/books/payments/interchange-and-pricing#a-pricing-engine)). When a cost for a closed period changes, the next run writes adjustment lines that reference the original lines and period, so a closed statement stays exactly as published ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)).

### Statements Partners Can Reproduce

A partner checks its statement against its own records, and the trade press tells it to: "Re-calculate your residuals using your Schedule A every month", and "If they don't provide you with enough detail to recalculate your residuals, find a company that will." Disputes have a clock, too: "Processors often require the ISO to challenge a residual payment within a limited time, such as 30 days."

So each line carries everything needed to recompute it without the provider's help: merchant, MID and fee line, volume and count, the merchant fee, the cost basis and whether it was pass-through or buy rate, the buy rate and split with their agreement versions, the result, and for adjustments the line they adjust. Recomputing a line from those fields is arithmetic, and rerunning the whole period from the same ledger entries and agreement versions produces identical lines; the run stores a hash of its inputs and the engine version to prove it. A dispute then resolves to one of three answers: the line is right, the input was wrong (fix with an adjustment), or the agreement was entered wrong (fix with a change set and an adjustment).

### Paying Partners and Reporting to the IRS

Residuals go out like any other payout to a counterparty ([Vendor Payouts](/books/payments/vendor-payouts)), usually by ACH credit to a verified account, on a fixed day after the run: Finix normally pays within 30 days of the billing settlement, Moov one business day after the billing period closes, and Tilled on the last day of the month after the activity. A changed partner bank account gets the same scrutiny as a changed vendor account ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)), because a redirected residual is a redirected payment like any other.

In the US the provider is an information reporter for what it pays partners. The IRS instructions put "fees, commissions, prizes and awards for services performed as a nonemployee" on Form 1099-NEC, box 1a, at $2,000 or more for tax years beginning after 2025, due to recipients and the IRS by January 31. Payments to corporations are generally exempt, apart from exceptions such as attorneys' fees, so an agent's entity type, from its W-9, decides whether it gets a form. Collect the W-9 at onboarding, TIN-match it, and support backup withholding as a ledger entry, exactly as for vendors ([Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s)). Report what was paid in the calendar year, not what was earned for it: a December residual paid in January belongs to the next year's form.

## How the Platforms Do It

Providers that sell through platforms publish their residual mechanics unevenly. The formulas are compared in [Revenue and Cost](/books/payments/payments-metrics#revenue-and-cost); the columns here are what a partner gets to check them with.

| Provider | Formula | Detail available | Timing and payment | Negative results | Interface |
| --- | --- | --- | --- | --- | --- |
| **Finix** | "Merchant Fees - Finix Costs = Residuals", of which the platform keeps "the portion of the Residuals specified in your agreement" | Residual by Merchant report | Generated monthly as a billing settlement; "normally paid out within 30 days" through billing transfers | "Residuals may be negative"; may not be paid out "if money is owed" | Reports, billing settlements |
| **Global Payments for Platforms** | Partner net revenue per merchant: "Merchant Fees + Refunded Merchant Fees + Partner Fees + Refunded Partner Fees"; profit shares split a percentage of income, expenses or both between entities | Revenue Summary per merchant; a profit share creates "a new entry" per transaction | Not documented | Not documented | Revenue Summary report (beta); profit shares per merchant or group |
| **Moov** | `residualAmount` = `netIncome` x `revenueShare` | Fee revenue and partner costs per residual, by API | One residual settlement transaction "one business day after the billing period closes", to the partner's wallet | A negative residual debits the wallet | Residuals API, monthly partner statements (PDF), `statement.created` webhook |
| **NMI** | Per merchant and service: resale, cost, commission earned | `parentAffiliate` and `subAffiliate` on every line, with `recollections` and `returns` | Not documented in the API; its residuals product offers "Streamlined ACH payouts" to agents | `recollections` field | `POST /v4/commission_reports/reports`; Merchant Central residuals management with agent splits, buy rates and "Built-in fee verification" |
| **Payabli** | Not documented publicly | "Records of the share of revenue a partner receives from individual transactions", per organization and sub-organization | Not documented | Not documented | Residuals in the Portal |
| **Tilled** | (merchant revenue - platform cost) x revenue share, per fee type | Commission Statement v2 with a Transaction Details tab of "transaction-level calculation details" | Paid the month after the activity, on its last day, by ACH | "a payment link will be shared to collect the balance" | Monthly statement in the dashboard |

Read across, three designs show. Moov and NMI expose residuals as data a partner's own systems can pull; Finix and Tilled publish statements with enough detail to recompute; Global Payments for Platforms and Payabli put residuals in the portal next to the hierarchy that produced them. Only NMI's line carries the agent tree (affiliate and sub-affiliate) on each row, which is what a provider selling through ISOs needs. None documents how a late network fee for a closed month reaches the statement, which is the question a careful partner asks first.

## How to Build It

These are deltas against [the core data model](/books/payments/card-payments#the-core-data-model) and the platform tables in [Payments for Software Platforms](/books/payments/software-platforms#how-to-build-it), whose `fee_change_sets` records who changed what and who approved it. Partners are not merchants: they never take payments, so they get their own tree.

```sql
CREATE TABLE partners (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_partner_id  UUID REFERENCES partners (id),   -- the ISO above a sub-ISO or agent
  legal_name         TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('iso', 'sub_iso', 'agent', 'referral', 'isv', 'bank')),
  entity_type        TEXT NOT NULL,                   -- from the W-9; decides 1099-NEC
  tin_token          TEXT,                            -- vaulted, never the TIN
  payout_bank_token  TEXT,                            -- vaulted, verified before first payout
  status             TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  terminated_reason  TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partner_principals (                     -- the people screened, per partner
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_id    UUID NOT NULL REFERENCES partners (id),
  full_name     TEXT NOT NULL,
  ownership_bps INTEGER CHECK (ownership_bps BETWEEN 0 AND 10000),
  valid_during  TSTZRANGE NOT NULL                    -- a change is a new row and a network notice
);

CREATE TABLE partner_screenings (                     -- MATCH Pro, sanctions, own terminated list
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  principal_id  UUID NOT NULL REFERENCES partner_principals (id),
  list          TEXT NOT NULL,                        -- 'match_pro', 'ofac', 'terminated_partners', ...
  list_version  TEXT NOT NULL,
  result        TEXT NOT NULL CHECK (result IN ('clear', 'possible_match', 'match')),
  reviewed_by   TEXT,
  screened_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partner_registrations (                  -- one per network, per acquirer
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_id       UUID NOT NULL REFERENCES partners (id),
  network          TEXT NOT NULL,                     -- 'visa', 'mastercard'
  acquirer         TEXT NOT NULL,
  category         TEXT NOT NULL,                     -- 'third_party_agent', 'iso', ...
  identifiers      JSONB NOT NULL DEFAULT '{}',       -- ISO ID, BINs, acquiring identifiers disclosed
  registered_at    TIMESTAMPTZ,                       -- confirmation received; nothing sells before it
  last_reviewed_at TIMESTAMPTZ,                       -- annual review
  ended_at         TIMESTAMPTZ,
  end_notified_at  TIMESTAMPTZ,                       -- 5 business days (Visa), one week (Mastercard)
  UNIQUE (partner_id, network, acquirer)
);

CREATE TABLE merchant_partner_assignments (           -- the selling chain, by date
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  partner_id    UUID NOT NULL REFERENCES partners (id),  -- the lowest level; parents by walking up
  valid_during  TSTZRANGE NOT NULL,
  change_set_id UUID NOT NULL REFERENCES fee_change_sets (id),
  EXCLUDE USING GIST (merchant_id WITH =, valid_during WITH &&)
);

CREATE TABLE partner_agreements (                     -- append-only; one version per period of terms
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_id       UUID NOT NULL REFERENCES partners (id),
  model            TEXT NOT NULL CHECK (model IN ('markup', 'revenue_share')),
  buy_rates        JSONB NOT NULL,      -- per fee line: {"bps": 15, "fixed": 5, "pass_through": false}
  split_bps        INTEGER CHECK (split_bps BETWEEN 0 AND 10000),
  split_base       TEXT CHECK (split_base IN ('margin_over_own_buy_rate', 'parent_share')),
  minimum          JSONB,               -- {"residual": 50000} or {"boarded_per_month": 3}
  holdback_bps     INTEGER NOT NULL DEFAULT 0,
  loss_share_bps   INTEGER NOT NULL DEFAULT 0,        -- share of merchant losses it carries
  vesting          JSONB,               -- the test and its meaning, from the contract
  valid_during     TSTZRANGE NOT NULL,
  recorded_during  TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  change_set_id    UUID NOT NULL REFERENCES fee_change_sets (id),
  CHECK (model = 'markup' OR (split_bps IS NOT NULL AND split_base IS NOT NULL))
);

CREATE TABLE residual_runs (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  period          DATERANGE NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('calculating', 'calculated', 'approved', 'paid', 'superseded')),
  inputs_hash     TEXT NOT NULL,                      -- ledger entries and agreement versions read
  engine_version  TEXT NOT NULL,
  run_by          TEXT NOT NULL,
  approved_by     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (approved_by IS NULL OR approved_by <> run_by)
);

CREATE TABLE residual_lines (                         -- immutable; each line recomputes from its own columns
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  residual_run_id      UUID NOT NULL REFERENCES residual_runs (id),
  partner_id           UUID NOT NULL REFERENCES partners (id),
  merchant_id          UUID REFERENCES merchants (id),
  payment_id           UUID REFERENCES payments (id), -- null for period lines (minimum, holdback)
  kind                 TEXT NOT NULL CHECK (kind IN ('share', 'adjustment', 'clawback', 'minimum',
                         'holdback', 'reserve_release', 'carry_forward')),
  fee_line             TEXT,                          -- 'card.discount', 'auth.fixed', ...
  volume               BIGINT,
  item_count           INTEGER,
  merchant_fee         BIGINT,
  cost_basis           BIGINT,                        -- buy-rate cost or actual pass-through
  pass_through         BOOLEAN,
  partner_agreement_id UUID REFERENCES partner_agreements (id),
  split_bps            INTEGER,
  amount               BIGINT NOT NULL,               -- signed, minor units
  currency             CHAR(3) NOT NULL,
  ledger_entry_ids     UUID[] NOT NULL DEFAULT '{}',  -- the revenue and cost entries read
  adjusts_line_id      UUID REFERENCES residual_lines (id),
  source_event         TEXT                           -- the loss, dispute or late fee behind it
);

CREATE TABLE partner_payouts (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  residual_run_id  UUID NOT NULL REFERENCES residual_runs (id),
  partner_id       UUID NOT NULL REFERENCES partners (id),
  amount           BIGINT NOT NULL CHECK (amount > 0),  -- a negative total carries forward instead
  currency         CHAR(3) NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'settled', 'returned', 'canceled')),
  tax_year         SMALLINT NOT NULL,                 -- the year it's paid, for 1099-NEC
  idempotency_key  TEXT NOT NULL UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (residual_run_id, partner_id)
);
```

The run's total posts as a ledger transaction from residual expense to a new liability account, `residuals_payable:{partner}`, and each payout clears it, so the accrued residual liability on the balance sheet is a sum of entries that ties to the approved runs ([Double Entry at Provider Scale](/books/payments/ledger-and-reconciliation#double-entry-at-provider-scale)). A superseded run is never deleted; a corrected run references it, and its lines stay as the evidence of what was published.

## Auditing

Residuals are audited from three directions: the sponsor bank and networks ask whether every partner was allowed to sell, finance and its auditors ask whether every dollar paid was owed, and partners ask whether every dollar owed was paid. Each answer should be a query.

- **Statements reproduce.** Sample partners and periods; recompute each sampled line from its stored inputs and rerun a sampled period from its `inputs_hash`. Then do what Priority's auditors did: compare the terms used to the signed agreement, agree the payout to the bank disbursement, and agree a sample of merchants' volumes to the processor's statements.
- **Every split traces to a change set.** Each agreement version links to a signed contract or amendment and an approver other than its author. Retroactive changes are listed with the adjustment lines they produced, and splits above policy carry a second approval.
- **Shares sum to fees.** For every payment in a run, the shares of all levels plus the cost equal the merchant fee. A run that fails the check doesn't publish.
- **Registration evidence.** For each active partner: registration confirmation with each network and acquirer before its first merchant's first payment, the identifiers disclosed and their last review, the annual review date, and principal screenings with list versions. A merchant whose selling partner wasn't registered on its boarding date is a finding.
- **Changes and endings were reported.** Each principal or ownership change and each termination, with the date the network was notified against the deadline, and the partner's due diligence file kept for two years after the end.
- **Clawbacks and holdbacks follow the contract.** Each clawback line links to the loss event and the liability term that assigns it; each holdback to its term, and its release to the schedule.
- **Tax reporting is complete.** Every partner paid $2,000 or more in a year that isn't exempt by entity type has a 1099-NEC, from the same payouts the ledger shows, and backup withholding applied wherever a TIN failed to match.

## What This Means for the System You Build

- **Model partners as their own tree,** separate from merchants, with each merchant assigned to one selling chain at a time by effective date.
- **Register before anyone sells:** network registrations per acquirer, identifiers disclosed and reviewed, principals screened against MATCH Pro, sanctions and your own terminated-partner list, and changes reported on the networks' clocks.
- **Keep partners away from merchant funds and fee control:** the acquirer approves merchant pricing and collects it, and a partner's influence on price is its agreement, not a write path.
- **Agreements as effective-dated data,** with the model, buy rates per fee line, split and its base, minimums, holdbacks, loss share and vesting, changed only by approved change sets.
- **Compute residuals from ledger entries** in one run per closed period, for every level of the tree, with each line storing every input and the check that all shares plus cost equal the merchant's fee.
- **Treat late costs and retroactive terms as adjustment lines** in the next run; never rewrite a published statement.
- **Give partners statements they can recompute,** at transaction or fee-line level, and expect disputes on a short clock.
- **Post clawbacks, holdbacks and minimums as their own lines,** carry negative totals forward as receivables, and pay positive ones idempotently by ACH.
- **File 1099-NEC from what was paid,** with W-9s, TIN matching and backup withholding from onboarding.

## References

**Specifications**

- [Visa Core Rules and Visa Product and Service Rules, 18 April 2026](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), the Third Party Agent definition; contract, registration, exemption and identifier disclosure effective 24 October 2026 in the US and Canada (1.9.8.5 to 1.9.8.8); due diligence, on-site inspection, annual review, 5-business-day change notice, member control of merchant fees and losses, 2-year file retention, solicitation materials and prohibition (10.2.2); the Visa Merchant Screening Service regions (10.17)
- [Mastercard Rules, 2 June 2026 (archived PDF)](https://web.archive.org/web/20260928113643/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/mastercard-rules.pdf), chapter 7: ISO program service (7.1), customer responsibility and the program service agreement (7.2.1, 7.2.3), no access to merchant funds (7.3), no subcontracting (7.4), acquirer approval of merchant fees and collection of discount (7.6.1, 7.6.2), ISO ID in transaction messages (7.6.6), registration through My Company Manager within 30 days, fees and per-acquirer registration (7.10), USD 25,000 per 30 days for noncompliance (within 7.10), prohibition (7.12) and termination notice within one week (7.13)
- [Mastercard: Security Rules and Procedures, Merchant Edition, August 2026 (archived PDF)](https://web.archive.org/web/20260919122811/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf), MATCH Pro inquiries for merchants and sponsored merchants (7.1.1), retained investigation records including service provider contracts and agents' due diligence for two years (7.1.2), and MATCH Pro's coverage of terminated merchants and their principal owners (11.1)
- [IRS: Instructions for Forms 1099-MISC and 1099-NEC](https://www.irs.gov/instructions/i1099mec), commissions for services by a nonemployee in 1099-NEC box 1a, the $2,000 threshold for tax years beginning after 2025, the January 31 deadline, and the general exemption for payments to corporations

**Reference**

- [OCC: Comptroller's Handbook, Merchant Processing (PDF)](https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/merchant-processing/pub-ch-merchant-processing.pdf), ISO/MSP as "independent sales organizations or membership service providers", agent banks with and without liability, background checks on ISO principals and cash deposits, and the ISO contract provisions (losses, security deposits, delayed payment of residuals, bank ownership of merchant relationships)
- [OCC Bulletin 2023-17: Third-Party Relationships, Interagency Guidance on Risk Management](https://www.occ.gov/news-issuances/bulletins/2023/bulletin-2023-17.html), the June 6, 2023 guidance from the OCC, Federal Reserve and FDIC
- [The Green Sheet: Residuals, are you getting a fair shake? (Elaina Smith)](https://greensheet.com/ebooks/gs210302/files/basic-html/page26.html), Schedule A, the revenue split, pass-through costs with margin built in, boarding and residual minimums, and recalculating residuals monthly
- [The Green Sheet: Key ISO rights and how to spot them (Adam Atlas)](https://greensheet.com/ebooks/gs240402/files/basic-html/page32.html), residuals as the ISO's consideration, payment while not in material uncured default, sudden-death clauses for re-solicitation, and ISO liability for merchant losses ([continued](https://greensheet.com/ebooks/gs240402/files/basic-html/page33.html): residual challenges within a limited time such as 30 days)
- [Priority Technology Holdings: Form 10-K for 2022](https://www.sec.gov/Archives/edgar/data/1653558/000165355823000030/prth-20221231.htm), commissions as a percentage of net revenues varying by program type and volume, ISOs assuming losses in partner programs, holding back residuals against debts, residual buyouts as intangible assets over 3 to 9 years, and the auditor's critical audit matter on residual commissions
- [Heartland Payment Systems: Form 10-K for 2015](https://www.sec.gov/Archives/edgar/data/1144354/000114435416000129/hpy1231201510kye.htm), portfolio equity, the vesting test of $10,000 average monthly gross margin over a rolling 90 days, residuals surviving employment, and the 2.5 times buyout multiple
- [Shift4 Payments: letter to the SEC, August 2022](https://www.sec.gov/Archives/edgar/data/1794669/000179466922000045/filename1.htm), residual buyouts and merchant portfolio purchases treated as intangible assets across the industry

**In practice**

- [Finix: Platform residuals](https://docs.finix.com/guides/platform-payments/monetizing-payments/platform-residuals), the residual formula, monthly billing settlements paid within 30 days, negative residuals and the Residual by Merchant report
- [Global Payments for Platforms: Billing and revenue reports](https://resource.payrix.com/docs/billing-and-revenue-reports.md), the Revenue Summary and partner net revenue per merchant
- [Global Payments for Platforms: Overview of billing and profit sharing](https://resource.payrix.com/docs/overview-of-billing-and-profit-sharing.md), profit shares splitting income and expenses between entities, with an entry per transaction
- [Huntington and Payabli (press release, February 19, 2026)](https://www.payabli.com/news/payabli-and-huntington-bank-join-forces-to-bring-seamless-payments-to-the-digital-banking-experience/), embedded payments in Huntington's online banking portal for its B2B customers
- [Moov: Partner billing](https://docs.moov.io/guides/billing/partner/), residual equals net income times revenue share, settlement one business day after the period closes, the residuals API, and monthly partner statements
- [NMI: See your commission](https://docs.nmi.com/reference/see-your-commission), commission report lines with affiliate, sub-affiliate, resale, cost, commission earned and recollections
- [NMI: Residuals management](https://www.nmi.com/products/merchant-central/residuals-management/), agent splits, buy rates, ACH payouts and built-in fee verification
- [Payabli: Navigate the Payabli Portal](https://docs.payabli.com/guides/platform-portal-navigation-overview), residuals as records of the share of revenue from individual transactions
- [Payabli: Manage organizations](https://docs.payabli.com/guides/pay-ops-portal-organizations-manage), residuals per organization and sub-organization
- [Payabli: Home page footer](https://www.payabli.com/), registered payfac of PNC Bank and Huntington Bank and registered ISO/MSP of Merrick Bank
- [Tilled: Commissions](https://docs.tilled.com/docs/commissions), commission per fee type, payment by ACH on the last day of the following month, the Transaction Details tab, and collecting negative balances
