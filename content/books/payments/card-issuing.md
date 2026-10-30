+++
title = "Card Issuing"
nav_title = "Card Issuing"
description = "Launching a card program: sponsor banks, program managers and issuer processors, prepaid, debit and credit law, the economics, card lifecycle and wallet tokens."
category = "Payments Industry"
order = 1428
part = "Issuing Cards"
tags = ["payments", "cards", "issuing", "sponsor-banks", "tokenization"]
+++

Everything before this part of the volume sits on the acceptance side: the merchant, the acquirer, the processor that speaks for them. Issuing is the other end of the same wire. The issuer holds the cardholder's account, answers every authorization, pays the network for every purchase, and carries the cardholder's legal rights. Until about 2015 that meant a bank running a card portfolio on a mainframe processor. Now a software company can put its own cards in its users' hands in weeks, because the bank, the processor and the operations can each be rented. What can't be rented away is the bank's liability, so every program is a stack of contracts that move risk around without making it disappear.

This chapter covers that stack: who the parties are and which contract binds each, what the platforms that sell issuing offer, what a sponsor bank requires before it lends its BIN, what each program type (prepaid, debit, credit, commercial) brings in law, where the money comes from, the businesses built on issuing (cards that spend from crypto balances among them), a card's life from creation to closing, and network tokens from the issuer's side. What happens inside the authorization (real-time decisioning, just-in-time funding, spend controls, stand-in, issuer fraud and disputes, and error resolution under Regulations E and Z) is in [Issuer Processing](/books/payments/issuer-processing).

## The Parties and the Stack

Issuing mirrors acquiring. On the acceptance side, a non-bank provider acquires under a sponsor bank that answers to the network for it ([How Card Payments Work](/books/payments/card-payments#the-parties), [The Sponsor Bank](/books/payments/becoming-a-payment-provider#the-sponsor-bank)). On the issuing side, a non-bank program issues under a **BIN sponsor**, the network member whose bank identification number the cards carry. The roles:

| Party | What it does | Its contract | What it carries |
| --- | --- | --- | --- |
| **Issuing bank (BIN sponsor)** | Owns the BIN and the cardholder relationship in law; holds the funds; approves every program | Network membership; program agreement with the program manager | Settlement to the network every day, and the regulator's view of every cardholder |
| **Program manager** | Designs the product, onboards cardholders, runs support, compliance operations and disputes | Program agreement with the bank; customer agreement with the brand | Its indemnity to the bank, usually backed by a reserve or collateral |
| **Brand or fintech** | Owns the user and the product; sometimes is its own program manager | With the program manager, or directly with the bank | Losses it agreed to take, and its users' trust |
| **Issuer processor** | Authorizes, posts, keeps the card ledger, produces network clearing and settlement files | With the bank or the program manager | Uptime, and the correctness of every balance it posts |
| **Card network** | Routes authorizations, clears and settles, writes the rules | Membership with the bank only | Its rules, enforced against the bank |
| **Card production** | Manufactures, personalizes and mails physical cards | With the processor or program manager | Physical and logical security of card data under PCI's card production standards |
| **KYC, sanctions and fraud vendors** | Verify identity, screen sanctions lists, score transactions and token requests | With the program manager or the processor | Nothing the bank can hand off: the bank still owns its customer identification program |

![The issuing stack: the cardholder presents a card, PIN or wallet token to the acquirer, which works for the merchant on the other side; the card network routes, clears and settles; the issuer processor authorizes, posts and keeps the ledger; the program manager funds or decides in real time. Requests run out on the upper arrows and answers come back on the lower ones, and the issuing leg (network to issuer processor to program manager) is accented as the authorization path, answered in seconds. Under the network, the sponsor bank holds the BIN, the funds and the liability and receives settlement; under the issuer processor, card production receives the card file to emboss, load the chip, mail the PIN and ship; under the program manager, risk vendors run KYC, sanctions and fraud checks.](/diagrams/pm-issuing-stack.svg "Every party on the issuing leg can be rented, but only the sponsor bank is a network member, so settlement and liability end there whoever made the decision.")

Two contracts matter more than the rest. The **program agreement** between the bank and the program manager says which products may launch, who funds settlement if the program can't, which compliance tasks the program manager performs on the bank's behalf, and how the bank may audit, suspend and exit. The **processing agreement** says whose instructions the processor follows; when it's signed by the program manager rather than the bank, the bank needs contractual access to the processor's data anyway, because the bank answers for every balance on it. The network contracts with neither: Visa requires its clients to register the third-party agents that provide payment services for them ([Visa: Third Party Agent Registration](https://partner.visa.com/site/programs/third-party-agent-registration.html)), so a program manager exists to the network as the bank's registered agent.

Many companies hold more than one seat. Adyen is its own issuer: its cards are issued by Adyen N.V., in the US through its San Francisco Branch. Marqeta is processor and program manager and picks the bank for each customer. Payabli is program manager, with an issuing bank, for the virtual cards it sends to vendors ([Vendor Payouts](/books/payments/vendor-payouts#who-earns-what)). Stripe offers program management with its partner banks or processing alone for a business that keeps its own bank relationships. Banks with their own portfolios use processors such as FIS, which bought Global Payments' issuer processing business (formerly TSYS) in January 2026, as [The Payments Landscape](/books/payments/payments-landscape#acquirers-and-processors) describes.

## How the Platforms Do It

What the issuing platforms that sell to software companies document publicly, as of October 2026:

| Platform | What it sells | Banks named | Real-time funding or decisioning | Wallet tokens | Physical cards |
| --- | --- | --- | --- | --- | --- |
| **Adyen** | Issuing in the EEA, UK and US, as the issuer itself | Adyen N.V. (US: San Francisco Branch) | Authorization requests relayed to your servers to approve or decline | Network tokens for digital wallets: activate, require 2FA or a call, or close; Apple Pay in-app provisioning | Creating a physical card starts a manufacturing order; designs approved by the network |
| **Galileo** (SoFi Tech Solutions) | Issuer processing, Visa Ready certified as an issuer processor | Sutton Bank (2018 release) | Auth API webhook; Real-Time Funding moves money to the card at authorization | Push provisioning to wallets | Client contracts an embossing vendor; card data sent by scheduled job |
| **i2c** | Issuer processing for credit, debit and prepaid, with program management support | Not documented | Not documented | Tokenized wallets for debit | Not documented |
| **Lithic** | Processing with direct Visa, Mastercard and American Express connections; program management with a path to self-manage | "25+ sponsor bank integrations", none named | Auth Stream Access: decline if no answer in 6 seconds | Push provisioning; your own tokenization decisions on Mastercard | Through card manufacturers, in a daily issuance file; bulk shipping |
| **Marqeta** | Processing and program management; it selects the issuing bank | Sutton Bank, its largest: 64% of 2025 volume | JIT Funding, managed or gateway, with its own stand-in | Green, yellow and red provisioning flows | Four fulfillment types, from individual mail to bulk |
| **Stripe Issuing** | Program management, or processing only | Celtic, Cross River, Fifth Third, Lead and Sutton, by product | Real-time authorization webhook, 2 seconds, then your timeout setting | Manual and push provisioning (Apple's entitlement required) | Standard physical cards at $3.50 each, shipping extra |

Three things stand out. **Sponsor concentration is real:** Marqeta settled 64% of its $382.5 billion 2025 processing volume through one bank, which is why an enforcement action against one sponsor reaches many programs at once ([Sponsor Banks Under Scrutiny](#sponsor-banks-under-scrutiny)). **Real-time control is now table stakes;** what differs is the timeout and what happens when you miss it, which [Real-Time Decisions](/books/payments/issuer-processing#real-time-decisions-webhooks-and-jit-funding) covers. **Banks are named by product, not by platform:** Stripe's consumer credit cards come from one bank and its commercial prepaid cards from three others, so a program's bank is a property of the product you pick.

## BIN Sponsorship

A sponsor bank lends its network membership and its charter, and it does so only for a program it can defend to its examiners. Before launch expect it to require:

- **Program approval.** A written description of the product, the target users, the funding flow, fees and the economics, reviewed by the bank's compliance, risk, and often credit committees. New products, new user segments or new countries later go back through approval ([Living With a Sponsor Bank](/books/payments/becoming-a-payment-provider#living-with-a-sponsor-bank)).
- **A compliance management system.** Written policies, a named compliance owner, training, monitoring and testing, and complaint handling, mapped to every law the product touches. The bank will read it, test it and audit it.
- **Customer identification under the bank's program.** The CIP rule (31 CFR 1020.220) requires a written, risk-based program that lets the bank form a reasonable belief it knows each customer's true identity, collecting at least name, date of birth, address and an identification number before the account opens. The program manager usually runs it, against the bank's procedures. Since June 27, 2025, an order from the OCC, FDIC and NCUA with FinCEN's concurrence lets banks obtain the full taxpayer identification number from a third-party source instead of the customer (the Federal Reserve joined on July 31, 2025), so collecting the last four digits and verifying the rest through a vendor is allowed when the bank's procedures say so.
- **Sanctions screening** against OFAC's lists at onboarding and on an ongoing basis, with matches stopped, not scored ([The Financial Crime Layer](/books/payments/payments-rulebook#the-financial-crime-layer)).
- **Transaction monitoring and suspicious activity referrals** from the program manager to the bank, which files the SARs.
- **Complaint handling,** logged, categorized, answered on a clock and reported to the bank, because complaints are where examiners look first.
- **Marketing review.** Every page, email and ad names the bank as issuer and doesn't call the fintech a bank or imply deposit insurance the structure doesn't provide. The disclosure reads like Stripe's: "Commercial Charge Cards are issued by Celtic Bank, Lead Bank, Fifth Third Bank, and Cross River Bank", product by product.
- **Reserves and reporting.** Collateral against the program's obligations, and the reports the bank defines, from daily balances to dispute and fraud rates.

**Network registration.** The bank registers the program and its agents with each network: the program manager and processor as third-party agents, which Visa requires before they perform services for the bank, and the product itself (prepaid, debit, consumer or commercial credit), which decides its interchange category and rules.

**BINs and account ranges.** The network assigns BINs to the member, now eight digits long ([BINs](/books/payments/card-payments#bins)), and a BIN can be divided into account ranges, each configured as its own product. A small program usually shares an account range or BIN with others at the same sponsor; a larger one gets a **dedicated BIN**. The difference shows up in places that look unrelated: wallet provisioning is enabled per BIN (Lithic's web push provisioning requires it), network stand-in options can depend on it (Stripe offers its network-fallback service only to users with their own dedicated BINs), and acquirers' BIN tables report product and regulated status per range, so a misclassified range miscategorizes every purchase on it. My default is a dedicated range from the start for any program expected to outlive its pilot, because moving live cards to a new BIN later means reissuing them.

## Program Types and the Law Each Brings

The product type decides which law applies, what the program may charge, and what it earns. Picking it is a legal decision with an engineering bill, so it comes first.

### Prepaid

A **prepaid account** under Regulation E is a card account funded in advance, reloadable or not, that isn't a checking account. The CFPB's prepaid rule (12 CFR 1005.18, with the agreement filing in 1005.19) took effect April 1, 2019, and brought:

- **Disclosures before acquisition:** a short form with the fees in a fixed format, and a long form with every fee, both before the consumer acquires the account.
- **An alternative to statements:** no periodic statement is required if the balance is available by phone, at least 12 months of history electronically, and 24 months in writing on request.
- **Liability limits and error resolution,** the debit-card protections of Regulation E (a consumer who reports a lost card within two business days owes at most $50), but not for an account whose identity verification the bank hasn't completed. That exception is why unverified prepaid programs keep tight limits and why verification is a state in the data model, not a checkbox. Payroll and government benefit accounts get the protections either way.
- **Agreements filed with the CFPB,** which publishes them.
- **Credit kept apart.** A prepaid card that can draw on a credit feature becomes a **hybrid prepaid-credit card**, a credit card under Regulation Z, and the credit feature can't be offered or linked until 30 days after the prepaid account is registered (12 CFR 1026.61). A store's own gift cards are a different product under a different section of Regulation E, covered with store credit in the Commerce volume's [Gift Cards and Store Credit](/books/commerce/promotions-and-gift-cards#gift-cards-and-store-credit).

The money sits at the bank, usually pooled in one account in the program's name for the cardholders. Whether each cardholder's balance is insured depends on pass-through deposit insurance: the FDIC's General Counsel's Opinion No. 8 treats funds underlying stored value products as deposits when placed at an insured bank, with cardholder coverage depending on the pass-through requirements, which in practice means records of who owns how much, kept daily ([FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).

### Debit

A debit card draws on a deposit account the bank holds for the cardholder. Regulation E governs it (liability, error resolution, unsolicited issuance), and Regulation II, the Federal Reserve's rule implementing the Durbin Amendment, adds two things the issuer must get right:

- **Routing.** Every debit card, prepaid included, must be enabled on at least two unaffiliated networks, and since July 1, 2023 that includes card-not-present transactions ([Regulated Debit](/books/payments/interchange-and-pricing#regulated-debit)). The routing rule has no small-issuer exemption, so every program needs a PIN debit network beside the brand, and the merchant chooses ([Processor Routing](/books/payments/processor-routing#us-debit-the-merchant-chooses)).
- **The interchange cap,** which applies to issuers that, with their affiliates, hold $10 billion or more in assets. Smaller issuers are exempt, as are reloadable general-use prepaid cards not marketed as gift cards, unless they charge overdraft fees or a fee for the first in-network ATM withdrawal each month. The Federal Reserve's data shows what the exemption is worth: in 2024, exempt debit transactions averaged $0.51 of interchange and covered ones $0.23. The cap itself is being rewritten after the October 2026 appeals ruling that [Interchange & Pricing](/books/payments/interchange-and-pricing#regulated-debit) tracks.

That gap is the business model of most fintech debit programs, and it ties the program to its bank's balance sheet: a sponsor that grows past $10 billion moves every debit program on it to the capped rate. Model the program's revenue per regulated status, and keep a second sponsor's terms current.

### Credit

A credit card is a loan, so the bank underwrites the cardholder (or approves the model that does) and Regulation Z applies in full. The CARD Act basics, as implemented in Regulation Z:

- **Ability to pay** before opening an account or raising a limit, with stricter rules under age 21 (1026.51).
- **Fee limits:** fees in the first year can't exceed 25% of the initial credit limit (1026.52).
- **Change-in-terms notice** at least 45 days ahead for significant changes, and limits on raising rates on existing balances (1026.9(c), 1026.55).
- **Unsolicited issuance** forbidden except as a renewal or substitute, and cardholder liability for unauthorized use capped at $50 (1026.12).

**Who carries the receivable** is the design question. The bank is the lender: Stripe's charge card terms say "Issuing Bank will extend you credit to cover the Card Transaction", with Stripe as the program manager the bank appointed. Programs differ in what happens next: the bank keeps the receivable, sells it or a participation in it to the program or a funding partner, or requires collateral against it. Whoever ends up with the receivable carries the credit loss and the funding cost, so the ledger needs a receivable account per cardholder and a clear owner for it. A **charge card**, paid in full each cycle, is the common commercial form, because it keeps the credit short. The revolving side (balance segments, grace periods, interest, minimum payments and the CARD Act's rate and fee rules) is in the Banking & Lending volume's [Credit Cards as Credit](/books/banking-and-lending/credit-cards).

### Commercial and Virtual Cards

Commercial cards (corporate, purchasing, fleet) are issued to a business, which changes the law more than the plastic. Regulation E covers consumer accounts only, and Regulation Z exempts business-purpose credit except its rules on issuance and unauthorized-use liability (1026.3(a) and its commentary), and even there an issuer that gives 10 or more cards to one organization's employees may agree different liability terms with the organization (1026.12(b)(5)). The diligence shifts to the business: beneficial owners and a controller, as in [Merchant Onboarding](/books/payments/merchant-onboarding#know-who-you-re-paying). Commercial cards also earn the highest interchange, which is why spend-management and payables companies issue them.

A **virtual card** is a card with no plastic, issued for one payment, one vendor or one employee's subscriptions. Payables use them as single-use and multi-use cards with controls, covered in [Single-Use and Multi-Use Cards](/books/payments/vendor-payouts#single-use-and-multi-use-cards). For the issuer they're the same account and card records without a production step, which makes them the fastest product to launch and the easiest to over-issue: each one still needs a limit, an expiry and an owner.

## The Economics

An issuing program earns from interchange, and everything else it collects or pays nets against it:

- **Interchange is issuer revenue.** The bank receives it from the acquirer on every purchase ([Interchange & Pricing](/books/payments/interchange-and-pricing)), at the regulated rate if the bank is covered and the network's rate if exempt. Product type and transaction type move it further: Marqeta's annual report notes that signature debit carries higher percentage-based interchange than PIN debit, and commercial products earn more than consumer ones.
- **The revenue share.** The bank keeps a fee and passes the rest to the program manager, which shares it with the brand. Marqeta describes its version: its bank contracts entitle it to the interchange from its customers' programs, it pays customers a revenue share, and it pays the card network fees and volume-tiered fees to the issuing banks. Payabli, as program manager for its vendor virtual cards, shares interchange with the platforms that send them.
- **Network fees and incentives.** The network charges the issuer per transaction and per service, and pays incentives for volume commitments; Marqeta reports tiered incentives based on processing volume. Incentive contracts lock a program to a network for years, so they belong in the decision of which brand to issue, not after it.
- **Processor fees,** per account, per card and per transaction, and the **bank's fees,** sometimes a minimum per month.
- **Card production.** Plastic, chip, personalization, the carrier and postage. Stripe lists $0.10 per virtual card and $3.50 per standard physical card in the US, before shipping.
- **What sponsoring earns the bank.** The Bancorp, one of the larger sponsor banks, reported $141.1 million of fintech fees for 2025, alongside the low-cost deposits its programs bring.

The other side of the ledger is losses: fraud the program absorbs, disputes it can't pass back, negative balances it can't collect, and the credit losses of any receivable it holds. My rule: price a program per card per month and per transaction from these lines before launch, with interchange at the exempt and regulated rates both, and keep that model next to the program record, because a change of bank, network or processor changes most of its inputs.

## What Gets Built on Issuing

Most companies that issue cards don't sell cards; they sell software or a service that the card makes pay. Four models account for most of the programs on the platforms above, and each leans on a different part of this chapter:

| Model | What the card does | Product type | Where the revenue comes from |
| --- | --- | --- | --- |
| **Spend management** | A corporate card bundled with expense software: receipts, approvals, accounting sync, per-employee limits | Commercial charge, sometimes commercial prepaid | Commercial interchange, plus software subscriptions |
| **Payables and expense cards** | Single-use or per-vendor virtual cards that pay bills, or cards issued per employee, trip or project | Commercial virtual, prepaid or charge | Interchange on supplier spend, shared with the platform that sends it |
| **Embedded issuing** | A vertical platform issues cards to its own business customers inside its product | Usually commercial prepaid or charge, funded per customer | The platform's share of interchange, and stickier customers |
| **Earned wage access cards** | A worker's earned pay is advanced onto a prepaid or payroll card the provider offers | Consumer prepaid or payroll card | Interchange on the worker's spend, and fees on other transfer options |

**Spend management** is the commercial charge card with software around it. Capital One's release on completing its acquisition of Brex (April 7, 2026) credits Brex with inventing "the integrated combination of corporate credit cards, spend management software" as one product ([The Payments Landscape](/books/payments/payments-landscape#recent-moves-as-of-october-2026)). Ramp's own help center says it earns "primarily through your use of the Ramp card and Ramp Plus subscriptions", and that because the card is a charge card it doesn't profit from interest on carried balances. That's the model in one line: [commercial interchange](/books/payments/interchange-and-pricing) pays for software the customer gets cheap or free, and the receivable stays short because the balance is due each cycle ([Credit](#credit)). The engineering weight sits in [spend controls](/books/payments/issuer-processing#spend-controls) and the real-time authorization, because "which employee may spend what, where" is the product.

**Payables and expense cards** are the same commercial rails pointed at suppliers: the virtual card is the payment method, and the rebate and the supplier's acceptance cost are the economics, both covered in [Vendor Payouts](/books/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate).

**Embedded issuing** is the issuing mirror of [embedded payments](/books/payments/software-platforms#four-ways-in). Stripe's guidance is to use Connect for Issuing whenever you issue cards to users who aren't your own employees, with its example "a business building a new expense management product for small businesses", each of which becomes a connected account. The terms show where the risk goes: Issuing supports only connected accounts where the platform is responsible for requirements collection and loss liability, and each account's cards draw on an Issuing balance funded before they can transact. A platform that issues therefore carries the KYB of every business it gives cards to ([Know Who You're Paying](/books/payments/merchant-onboarding#know-who-you-re-paying)) and the losses on their spend, on top of whatever it carries for acceptance.

**Earned wage access** pays a worker wages already earned before payday, and a card is often where the money lands. In its advisory opinion of December 23, 2025, the CFPB concluded that EWA meeting its conditions (an advance within wages already earned, repaid only by payroll deduction, with no recourse beyond it and no credit underwriting) isn't credit under Regulation Z, so its fees aren't finance charges; several states regulate EWA under their own laws. Providers steer workers toward their own card: Payactiv's card is issued by Central Bank of Kansas City, and its terms make real-time EWA transfers free with a qualifying direct deposit of $200 or more per pay period to that card, while "a transaction fee may apply" to other instant transfers. The card then earns interchange on the worker's spend. For the issuer, that's a consumer prepaid or payroll card program with all of Regulation E's [prepaid](#prepaid) obligations, whatever the advance itself is called.

What these models share is that the card is a feature of someone else's product, so the program agreement, the losses and the bank's examiners still land on the stack described above. The bank side of the business (deposit accounts, lending, underwriting and credit risk) belongs to the Banking & Lending volume; this chapter stops at the card.

## Crypto- and Stablecoin-Linked Cards

A fifth model has grown fast enough to need its own section: a card that spends from a crypto or stablecoin balance. Visa counted more than 130 stablecoin-linked card programs in more than 50 countries on March 31, 2026, and more than 160 by its September 8, 2026 release, with payment volume on them up nearly 200% year over year. To the merchant, nothing is different: the card is a Visa or Mastercard credential, the purchase clears in fiat, and the merchant is paid in its own currency. Everything that differs sits behind the issuer, in where the asset is held, when it becomes dollars, and who carries the gap. What a stablecoin is, how it moves and how a provider screens and reconciles it is in [Stablecoins & Crypto Rails](/books/payments/stablecoins); this section covers only the card.

### Where the Conversion Happens

The network settles in fiat, or in a stablecoin it accepts for settlement, never in the cardholder's arbitrary token. Visa's rules put it plainly: "Any non-fiat currency funds must be converted to a fiat currency before deposit into a Cardholder account linked to a Visa Card," and the issuer needs Visa's approval before launching a program linked to an account that accepts funds previously converted from non-fiat currency (Visa Core Rules 1.4.4.6). Mastercard said the same in 2021: crypto spent on its network "must enter and settle on Mastercard's network as traditional fiat currency." Programs differ in when that conversion happens, and the published ones fall into three models:

| Model | When the asset becomes spendable money | Who holds the asset | Example, from its public docs |
| --- | --- | --- | --- |
| **Top-up** | Before the purchase: the cardholder converts crypto into a fiat card balance | The exchange, until converted; then a bank, in dollars | Crypto.com's US prepaid card holds "Only US Dollars (USD)"; a top-up quote is held for 15 seconds |
| **Just-in-time pull** | At authorization: the program pulls stablecoins from a wallet on chain | The cardholder (self-custody, with an on-chain approval) or a custodian | Bridge with Stripe Issuing pulls "at the time of authorization" from a non-custodial wallet or a Bridge-custodied one; Rain's real-time funding (beta) commits the amount at authorization "where it stays until settlement" |
| **Collateral or credit** | After clearing: the program extends a line backed by stablecoins locked as collateral, and settles from it | A collateral contract or a program-level account | Rain's corporate card limit is "backed by the stablecoins you deposit into your account's smart contracts", with balances unpaid by the 8th of the month "automatically liquidated from your collateral"; Reap's user-funded model settles cleared spend "on a schedule" from each user's wallet, and its program-funded model collateralizes every card from one master account |

The top-up model is an ordinary [prepaid](#prepaid) program with a crypto exchange in front of it, and it's the easiest to defend to a bank: Crypto.com's agreement says "No cryptocurrency debits, credits or balances will take place" on the card, and that the crypto isn't held at the bank or FDIC-insured. The just-in-time model is [JIT funding](/books/payments/issuer-processing#real-time-decisions-webhooks-and-jit-funding) where the funding source is a chain: an on-chain transaction inside a two-second authorization budget, which is why Stripe doesn't hand the program its real-time authorization webhook by default "because of transaction submission latency requirements". The collateral model is a [credit](#credit) program whose security is a token, which brings Regulation Z if it's consumer credit and a liquidation policy either way.

### Who Issues and Who Settles

A crypto card still has an issuing bank or a network principal member behind it, and the public programs name theirs:

- **Crypto.com (US):** issued by Community Federal Savings Bank, with Foris, Inc. as program manager, as of the agreement effective September 1, 2026.
- **Bridge:** Lead Bank, named in Stripe's partnership announcement with Visa (April 30, 2025) and in the cardholder terms a commercial program must pass to each cardholder. Visa and Bridge reported cards live in 18 countries on March 3, 2026.
- **Rain:** its US debit cards are "Visa® debit cards issued by Cross River Bank" with Rain as program manager, while Visa describes Rain as a Visa Principal Member that powers programs around the world. One company can be a program manager under a sponsor in one market and the issuer in another.
- **Reap:** announced stablecoin-linked Visa credit programs for more than 100 markets with Visa on September 23, 2026, with partners using stablecoins as collateral and cardholders repaying in them. Its own stablecoin corporate credit cards are "Issued by Reap, a Visa Principal Member in Hong Kong and Mexico," the same pattern as Rain: the company is the issuer where it holds the network membership.
- **Mastercard** gave Wirex principal membership in 2020, "allowing it to directly issue payment cards", and said it would only work with crypto partners that follow its core principles.

Settlement is where the networks are changing. Visa describes two models: in the traditional one, "program managers convert stablecoins to fiat before settling with Visa"; in the emerging one, adopted by its principal members, issuers settle directly with Visa in supported stablecoins such as USDC, which is the network settlement in [How the Platforms Do It](/books/payments/stablecoins#how-the-platforms-do-it). Settling in stablecoins lets a program settle every day including weekends, which matters because its cardholders spend every day, and Visa's own write-up on financing these programs starts from the same constraint every issuer has: it "has to fund its daily settlement obligation before it collects from cardholders."

**KYC doesn't get easier because the money is on chain.** The bank's [customer identification program](#bin-sponsorship) applies as for any card, and Stripe's Bridge guide shows a sponsor tightening it: "Per existing bank partner rules," a cardholder must have completed KYC or confirmed their information within the past 24 hours before a card is created. On top of the bank's program sits the screening in [Screening Wallets and Addresses](/books/payments/stablecoins#screening-wallets-and-addresses), because a self-custody wallet that funds a card is a counterparty address like any other.

### The Ledger When the Balance Is a Token

A card ledger already handles authorizations and clearing that disagree ([The Ledger for an Issuer](/books/payments/issuer-processing#the-ledger-for-an-issuer)). Funding from a chain adds a second ledger that must agree with the first, and four places where they drift:

- **The pull is not the hold.** Bridge "might also proactively pull an additional amount at the time of authorization based on the MCC and the overcapture upper bound, and refunds any difference when they know the final amount at capture time"; if capture still exceeds what was pulled, "another crypto transaction is submitted"; when an authorization expires, "any remaining authorized funds are pushed back" to the wallet. Every authorization can therefore produce several on-chain transfers in both directions, and each needs to be matched to the authorization, the increment or the capture that caused it.
- **Price moves between authorization and clearing.** With a dollar stablecoin the amount is stable and the risk is the peg and the fees. With a volatile asset, whoever converts at authorization and settles at clearing holds the asset's price for the days in between, plus the over-capture margin. My rule: convert at authorization at a quoted rate, record the rate and the asset amount on the hold, and price the program's spread to cover the move on a clearing that arrives days later, rather than reconverting at clearing and passing the difference to the cardholder.
- **Refunds return to a volatile asset, or don't.** Crypto.com's refunds credit the card's dollar balance. Bridge returns refunds on chain to the cardholder's wallet, "asynchronously," and "can batch multiple refunds into the same onchain transaction," so one on-chain transfer can carry several refunds and the match is one-to-many. Decide and disclose which asset and which rate a refund comes back in; a refund of a $50 purchase returned as the token amount spent can be worth more or less than $50 by the time it lands.
- **Provisional credit can't be clawed back from a wallet you don't control.** Stripe's Bridge guide pushes dispute "provisional credits and other refunds associated with the dispute directly to your non-custodial wallet." Regulation E lets an issuer reverse a provisional credit when it finds no error ([Debit and Prepaid: Regulation E](/books/payments/issuer-processing#debit-and-prepaid-regulation-e)); on a self-custody wallet, the reversal is a new pull that depends on the cardholder's approval still being active and funded. Book a provisional credit sent on chain as a receivable from the cardholder until the dispute closes.

Reconcile both sides daily: the card ledger against the processor's clearing, as for any program, and every pull, refund and return against the chain at a block height, as in [Reconciliation Against the Chain](/books/payments/stablecoins#reconciliation-against-the-chain).

**Tax follows every swipe.** The IRS treats digital assets as property, and "If you pay for services using digital assets, then you have disposed of the digital assets" with a capital gain or loss; that holds for stablecoins held as capital assets too. Brokers report gross proceeds for transactions from January 1, 2025 and basis for certain transactions from January 1, 2026. A card that spends a cardholder's crypto turns each purchase into a disposal, so the program keeps the asset amount, rate and time of every conversion, in the form its broker reporting needs.

### When Not To

A crypto-linked card helps where the cardholder's money already lives on chain and a bank account is the hard part: users of an exchange or wallet who want to spend without cashing out first, payroll or payouts received in stablecoins in countries where local banking is slow, and businesses that keep treasury in stablecoins. It doesn't help a program whose users hold dollars in a bank, because it adds an exchange, a chain, wallet screening and possibly custody licensing ([Custody or Not](/books/payments/stablecoins#custody-or-not)) to a product that works without them. My rule: launch with a dollar stablecoin and a top-up or just-in-time model before any volatile asset, keep the conversion and custody with a licensed partner, and treat a collateral-backed credit card as a lending product first and a crypto product second.

## The Card Lifecycle

A card is not an account. The account holds the balance and the legal relationship; the card is one credential for it, with its own number, expiry, state and history, and an account outlives many cards. Keep them separate from the first table.

### Creating and Producing the Card

Creating a card generates a PAN in the program's account range, an expiry and the verification values, and it never leaves the issuer processor and the vault in the clear ([Running a Card Vault](/books/payments/card-vault)). Rules first: Regulation Z permits a credit card only on request or as a renewal or substitute, and Regulation E restricts unsolicited debit and prepaid cards to ones that can't be used until validated, so the request is a record you keep.

A virtual card is usable once created. A physical card goes into a file for a card bureau that embosses or prints it, loads the chip, inserts it into a carrier and mails it. Adyen starts a manufacturing order when the card is created, and each design is approved by the network first; Galileo's clients contract their own embossing vendor and a scheduled job sends it the new cards; Lithic batches orders into a daily issuance file and lets cards ship in bulk to one address; Marqeta supports four fulfillment types from personalized cards mailed to each cardholder to bulk shipments to a business. The bureau handles card data under the PCI Card Production and Provisioning standards, a Physical and a Logical set (version 3.0 in January 2022, with v3.0.1 errata in June 2022) covering manufacturers, personalizers, fulfillment and PIN generation. For the program, the bureau is a file and a status feed: ordered, produced, shipped, returned undeliverable.

### Activation and PINs

A mailed card should arrive inactive and become usable only when its holder activates it, which defeats theft from the mail. Adyen issues US physical cards inactive by default; Galileo requires both the account and the card to be active before either works. Activate through an authenticated channel (the app, a call to a verified number) and require something the card carries, such as its last four digits or its verification code.

The PIN is set by the cardholder in the app or at a bank ATM, or mailed separately, and verified by the issuer processor in its HSM. The program's own systems should never see it in the clear: a PIN entered in your app travels encrypted to the processor, under the PIN block rules in [DUKPT and PIN Blocks](/books/payments/key-management#dukpt-and-pin-blocks), or is captured by the processor's own component. Count PIN retries per card, lock after the limit, and record every PIN set and change as an event.

### Replacement, Expiry and Reissue

Three different events all produce a new card, and each treats the old one differently:

- **Lost or stolen:** close the old card at once, issue a new PAN, and move nothing else.
- **Damaged:** keep the PAN, issue new plastic, and leave the old card working until the new one is activated.
- **Expiring:** a reissue job runs ahead of expiry (weeks ahead for physical cards, to allow production and mail), issues a new expiry and verification code on the same PAN or a new one, and closes the old card on activation of the new or at expiry, whichever comes first.

Each replacement points at the card it replaced, and recurring merchants keep charging the old one. Two network services carry the change to them. **Account updater** is the issuer's half of the service merchants query ([Keeping the Card Alive](/books/payments/stored-credentials#keeping-the-card-alive)): the issuer reports new numbers, expiry dates, closed accounts and "contact cardholder" advices, and Visa recommends that issuers enroll all their BINs. **Network tokens** follow the card if the issuer tells the token service about the replacement; Marqeta leaves a card's wallet tokens unchanged by default when the card transitions, so they keep working until the cardholder receives the replacement, and terminates Visa tokens automatically when the card behind them expires.

### Closing

Close the card, then the account, in that order, and never reverse a closed card. Galileo's documentation says a canceled PAN "cannot be used and should not be reactivated". The account stays open long enough for pending authorizations, refunds and disputes to settle, then pays out or refunds any remaining balance. A prepaid balance nobody claims becomes unclaimed property under state law, like the uncashed checks in [Vendor Payouts](/books/payments/vendor-payouts#checks-are-still-here). Closing is also a token event: terminate the card's network tokens so a wallet doesn't keep a dead card.

## Tokenization on the Issuer Side

From the merchant's side, a network token is a credential that keeps working ([Card Numbers and Tokens](/books/payments/card-payments#card-numbers-and-tokens)). From the issuer's side, it's a new credential for the same account that someone else asked for, and the issuer decides whether it exists. EMVCo's payment tokenisation framework defines the shape: a token limited to a merchant, device or use, issued by a token service provider (Visa Token Service, Mastercard MDES) that asks the issuer before it provisions.

**The decision.** When a cardholder adds a card to Apple Pay or Google Pay, the wallet, the network and the issuer each assess the request, and the most restrictive answer wins. The outcomes are named by color:

- **Green:** approved and active with no further step.
- **Yellow:** the cardholder must verify (**ID&V**, identification and verification) before the token activates: a one-time code by SMS or email, verification in the issuer's app, or a call to support. Adyen's risk analysis ends in the same choices (activate, require two-factor authentication, require a call, or close), and Marqeta's documentation lists exactly those three methods.
- **Red:** declined; no token is created.

Lithic exposes the same choice as a webhook your system answers with `APPROVE`, `AUTHENTICATE` or `DECLINE`, decides for you if you don't answer within 2.5 seconds, and won't let you be more permissive than the wallet requires. Its documentation also says why the decision deserves the care: fraud on a digital wallet card is generally not disputable with the networks, because wallet transactions are categorized as card-present. A fraudster who passes the provisioning check holds a card-present credential the issuer can't charge back.

My rule for provisioning: green only when the device, the wallet's own score and the card's recent history all agree, and yellow by default for a card issued or re-addressed in the last few days, or provisioned on a new device right after a password or phone number change. ID&V codes go only to contact details that were on file before the request.

**Push provisioning** lets the cardholder add the card from the issuer's app, which is both easier and safer, since the app already authenticated them. It takes approval from each wallet: Apple's `com.apple.developer.payment-pass-provisioning` entitlement for in-app provisioning, which Stripe requests on its users' behalf after manual provisioning is approved (itself one to two weeks for Apple Pay), and a one-time Apple Business Register enrollment for web provisioning, which Galileo estimates at 7 to 10 business days.

**The token lifecycle** is its own state machine, independent of the card: requested, active, suspended, and terminated or declined, in Marqeta's terms, with each token tied to one card and exclusive to one wallet on one device. A card has many tokens at once (a phone, a watch, several merchants), and each event on the card has to decide what happens to them: suspend tokens when the card is locked, terminate them when it's closed, and keep them through a replacement so the cardholder's phone keeps working. Who requested each token and for what is the issuer's record of where its credential lives, which is also what [Running a Card Vault](/books/payments/card-vault) and [Stored Cards & Recurring Billing](/books/payments/stored-credentials#keeping-the-card-alive) need from the other side.

## Certification

An issuer processor certifies its host with each network, the issuing mirror of [Card Network Certification](/books/payments/network-certification#card-network-certification); Galileo announced its Visa Ready certification as an issuer processor in October 2022. Token services certify separately: Marqeta notes that approving token requests requires integration and certification with each network's tokenization service ([3-D Secure and Tokens](/books/payments/network-certification#3-d-secure-and-tokens)). A program launching on a certified processor doesn't repeat the network's host tests; it gets its products configured, its card designs approved, its wallet approvals, and the bank's sign-off on its test results. Each new product, BIN or wallet goes through the same steps again, so keep the evidence per product.

## Sponsor Banks Under Scrutiny

Bank regulators have spent the last three years making sure a sponsor bank can't outsource its obligations along with its operations. The June 2023 interagency guidance on third-party relationships expects a bank to plan, diligence, contract with, monitor and be able to exit each partner. On July 25, 2024 the FDIC, Federal Reserve and OCC added a joint statement on arrangements with third parties to deliver deposit products, which said a bank's use of third parties "does not diminish its responsibility to comply with all applicable laws and regulations", and a request for information on bank-fintech arrangements.

Enforcement made that concrete. From the public orders:

- **Blue Ridge Bank:** an OCC consent order dated January 24, 2024 over its BSA/AML program, which replaced a 2022 formal agreement about its fintech partnerships. The OCC terminated it, as the bank announced on November 13, 2025.
- **Lineage Bank:** an FDIC consent order effective January 29, 2024, requiring a contingency plan to exit significant fintech partners in an orderly way, and the FDIC's approval before entering or significantly expanding lines of business.
- **Sutton Bank:** an FDIC and Ohio Division of Financial Institutions consent order dated February 1, 2024, the most specific about issuing. It required an inventory of third-party relationships detailing which parts of AML compliance each program manager performs (CIP, transaction monitoring, independent testing, suspicious activity reporting), quarterly reporting on their compliance, review of the suspicious activity monitoring done by its prepaid program managers, prepaid program managers to collect all required CIP information "including the full first name of customers at account opening", and a CIP lookback of prepaid card customers back to July 1, 2020.
- **Evolve Bank & Trust:** a Federal Reserve and Arkansas State Bank Department cease-and-desist order announced June 14, 2024, for unsafe practices in its fintech partnerships, AML and consumer compliance, requiring prior approval for new fintech partners and products. Evolve was a partner bank of Synapse, whose collapse is in [Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance).

As of October 2026, of these four, I found a public termination only for Blue Ridge's order. The lesson for a program is in Sutton's order: an examiner can ask the bank, for each program, who performs each compliance task, how the bank knows it's done, and what the customer records say, back years. A program that can answer from its own records passes a sponsor audit; one that has to reconstruct them is the reason the bank gets the order.

What a sponsor audit samples, and what to keep ready:

- **CIP files per cardholder:** what was collected, from which vendor, the result, and how mismatches were resolved, under the bank's procedures in force at the time.
- **The compliance task matrix:** which party performs each obligation, with evidence it ran.
- **Monitoring alerts and dispositions,** SAR referrals to the bank and their timing.
- **Complaints,** each one, with category, response and time to close.
- **Marketing approvals:** every published version and the bank's sign-off.
- **Daily balance files** per cardholder, reconciled to the bank's account to the cent.
- **Disputes and error resolution timelines** against the regulation's clocks ([Cardholder Disputes](/books/payments/issuer-processing#cardholder-disputes)).
- **Change approvals** for every product, fee or vendor change.

## How to Build It

These are deltas against [the core data model](/books/payments/card-payments#the-core-data-model). The core tables model acceptance; issuing gets its own records, and every movement of money still posts to the same ledger. The authorization and its holds belong to [Issuer Processing](/books/payments/issuer-processing#how-to-build-it).

```sql
CREATE TABLE card_programs (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  name              TEXT NOT NULL,
  sponsor_bank      TEXT NOT NULL,
  program_manager   TEXT NOT NULL,             -- may be the platform itself
  issuer_processor  TEXT NOT NULL,
  network           TEXT NOT NULL CHECK (network IN ('visa', 'mastercard', 'amex', 'discover')),
  debit_network     TEXT,                      -- the unaffiliated network Regulation II requires
  bank_approval_ref TEXT NOT NULL,             -- the bank's approval of this program, by reference
  status            TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'live', 'suspended', 'winding_down', 'closed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_products (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES card_programs (id),
  product_type        TEXT NOT NULL CHECK (product_type IN ('prepaid', 'debit', 'consumer_credit',
                        'commercial_credit', 'commercial_charge', 'commercial_prepaid')),
  bin                 TEXT NOT NULL CHECK (length(bin) IN (6, 8)),
  account_range_low   TEXT NOT NULL,
  account_range_high  TEXT NOT NULL,
  dedicated_range     BOOLEAN NOT NULL,
  regulated_debit     BOOLEAN,                 -- Regulation II status, NULL for credit
  funding_model       TEXT NOT NULL CHECK (funding_model IN ('prefunded', 'jit', 'credit_line',
                        'onchain_jit', 'crypto_collateral')),
  form_factors        TEXT[] NOT NULL,         -- 'virtual', 'physical'
  wallets_enabled     BOOLEAN NOT NULL DEFAULT false,
  disclosure_version  TEXT,                    -- prepaid short and long form, or credit agreement
  network_approved_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cardholders (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id         UUID NOT NULL REFERENCES card_programs (id),
  kind               TEXT NOT NULL CHECK (kind IN ('individual', 'business', 'employee')),
  business_id        UUID REFERENCES cardholders (id),  -- the business, for an employee
  legal_name         TEXT NOT NULL,
  identity_token     TEXT NOT NULL,            -- vaulted date of birth, address, TIN
  kyc_status         TEXT NOT NULL CHECK (kyc_status IN ('pending', 'verified', 'failed', 'manual_review')),
  kyc_vendor_ref     TEXT,
  cip_procedure_version TEXT,                  -- the bank's procedure it was verified under
  verified_at        TIMESTAMPTZ,
  sanctions_screened_at TIMESTAMPTZ,
  phone_changed_at   TIMESTAMPTZ,              -- recent contact changes feed token decisions
  email_changed_at   TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_accounts (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  cardholder_id     UUID NOT NULL REFERENCES cardholders (id),
  product_id        UUID NOT NULL REFERENCES card_products (id),
  ledger_account_id UUID NOT NULL REFERENCES ledger_accounts (id),  -- the balance is the ledger's
  currency          CHAR(3) NOT NULL,
  credit_limit      BIGINT CHECK (credit_limit > 0),                -- credit products only
  receivable_owner  TEXT CHECK (receivable_owner IN ('bank', 'program', 'funding_partner')),
  status            TEXT NOT NULL CHECK (status IN ('open', 'frozen', 'closing', 'closed')),
  opened_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at         TIMESTAMPTZ
);

CREATE TABLE cards (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  card_account_id   UUID NOT NULL REFERENCES card_accounts (id),
  vault_token       TEXT NOT NULL,             -- the PAN lives in the vault, never here
  last4             CHAR(4) NOT NULL,
  exp_month         SMALLINT NOT NULL,
  exp_year          SMALLINT NOT NULL,
  form_factor       TEXT NOT NULL CHECK (form_factor IN ('virtual', 'physical')),
  status            TEXT NOT NULL CHECK (status IN ('inactive', 'active', 'locked', 'closed')),
  replaces_card_id  UUID UNIQUE REFERENCES cards (id),  -- a card is replaced at most once
  replace_reason    TEXT CHECK (replace_reason IN ('lost', 'stolen', 'damaged', 'expiring', 'compromised')),
  requested_by      TEXT NOT NULL,             -- the request Regulations E and Z require
  fulfillment_status TEXT CHECK (fulfillment_status IN ('ordered', 'produced', 'shipped', 'returned')),
  pin_retries       SMALLINT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at      TIMESTAMPTZ,
  closed_at         TIMESTAMPTZ
);

CREATE TABLE card_tokens (                     -- network tokens provisioned against a card
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  card_id             UUID NOT NULL REFERENCES cards (id),
  token_service       TEXT NOT NULL CHECK (token_service IN ('vts', 'mdes', 'other')),
  token_reference     TEXT NOT NULL UNIQUE,     -- the token service's reference, not the token number
  token_requestor     TEXT NOT NULL,            -- wallet or merchant, by requestor ID
  device_type         TEXT,
  provisioning_path   TEXT NOT NULL CHECK (provisioning_path IN ('manual', 'push_app', 'push_web', 'merchant')),
  decision            TEXT NOT NULL CHECK (decision IN ('green', 'yellow', 'red')),
  idv_method          TEXT CHECK (idv_method IN ('otp_sms', 'otp_email', 'app', 'call_center')),
  status              TEXT NOT NULL CHECK (status IN ('requested', 'active', 'suspended', 'terminated', 'declined')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_lifecycle_events (           -- append-only: every change to a card or token
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  card_id      UUID NOT NULL REFERENCES cards (id),
  token_id     UUID REFERENCES card_tokens (id),
  event        TEXT NOT NULL,                  -- 'created', 'shipped', 'activated', 'pin_set', 'locked',
                                               -- 'replaced', 'token_provisioned', 'closed', ...
  from_status  TEXT,
  to_status    TEXT,
  actor_type   TEXT NOT NULL CHECK (actor_type IN ('cardholder', 'agent', 'system', 'bank', 'network')),
  actor_id     TEXT,
  reason       TEXT,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_funding_wallets (            -- crypto-linked products: the wallet a card spends from
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  card_account_id    UUID NOT NULL REFERENCES card_accounts (id),
  asset_id           UUID NOT NULL REFERENCES assets (id),           -- token per chain, from Stablecoins
  wallet_address_id  UUID NOT NULL REFERENCES wallet_addresses (id),
  custody            TEXT NOT NULL CHECK (custody IN ('self_hosted', 'custodian', 'program')),
  approval_limit     NUMERIC(78,0),            -- the on-chain approval, in base units, when self-hosted
  approval_tx_hash   TEXT,
  status             TEXT NOT NULL CHECK (status IN ('active', 'approval_revoked', 'closed')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_funding_movements (          -- every pull, top-up, return and refund on chain
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  funding_wallet_id   UUID NOT NULL REFERENCES card_funding_wallets (id),
  authorization_id    UUID REFERENCES issuer_authorizations (id),     -- from Issuer Processing
  clearing_id         UUID REFERENCES clearing_records (id),
  kind                TEXT NOT NULL CHECK (kind IN ('auth_pull', 'buffer_pull', 'capture_pull',
                        'buffer_return', 'expiry_return', 'refund', 'provisional_credit', 'liquidation')),
  asset_amount        NUMERIC(78,0) NOT NULL,   -- token base units
  fiat_amount         BIGINT NOT NULL,          -- card currency, minor units
  rate                NUMERIC(38,18) NOT NULL,  -- the conversion used; the tax and dispute record
  onchain_transfer_id UUID REFERENCES onchain_transfers (id),          -- one transfer can carry several refunds
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The card's status changes only by writing a lifecycle event in the same transaction, so the history can't drift from the state. A replacement is a new row pointing at the old one through `replaces_card_id`; its unique constraint stops two replacements of one card, which is how a double-clicked "report lost" becomes one new card instead of two. Closing a card writes a `token_terminated` event for each of its active tokens in the same transaction. The account's balance is the sum of its ledger entries, never a column, and a prepaid program's daily per-cardholder balance file for the bank is a query over `card_accounts` and the ledger. For a crypto-linked product, each authorization, capture, expiry and refund writes a `card_funding_movements` row in the same transaction as its hold or posting, so the card ledger and the chain can be matched row by row: the sum of an authorization's pulls minus its returns equals what cleared, and a `provisional_credit` stays open as a receivable until the dispute closes. `cardholders` holds no identity numbers; they're in the vault behind `identity_token`, with `cip_procedure_version` recording which version of the bank's procedure each verification satisfied.

## Auditing

The sponsor bank, its examiners, the networks and the CFPB can each ask for an issuing program's records, and the general design is in [Audit Trails](/docs/architecture/audit-trails). For card issuing, make sure the record shows:

- **The program as approved:** the bank's approval, the products and fees it covered, and each later change with its approval, so any card can be traced to an approved product.
- **Each cardholder's identification:** what was collected, from whom, which vendor verified it and the result, the bank procedure it ran under, and sanctions screening with its list version, kept for the BSA retention period.
- **Every card's life:** request, production, shipping, activation, PIN events, locks, replacement and closing, with the actor, from `card_lifecycle_events` ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Every token decision:** the request, each party's recommendation, the decision, the ID&V method and its outcome, because provisioning fraud is investigated from these.
- **Disclosures as shown:** the version of the prepaid short and long form or credit agreement each cardholder received, and when.
- **Who saw a full card number or PIN-related data,** including support agents revealing a card in the console ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Every conversion on a crypto-linked card:** the asset, amount, rate and time of each pull, return and refund, matched to its authorization and to the chain, for disputes, the bank and tax reporting.
- **Balances the bank can rely on:** the daily per-cardholder file, its reconciliation to the bank's account, and every break and how it was resolved.

## What This Means for the System You Build

- **Know who holds each contract and each liability,** and keep the program agreement's compliance task matrix as data you can show, not a PDF.
- **Pick the product type first,** because prepaid, debit, credit and commercial each bring their own law, disclosures and interchange.
- **Treat the bank's asset size as an input,** with program economics modeled at the exempt and regulated rates, and a second sponsor's terms kept current.
- **Get a dedicated account range** for any program meant to last, because wallet enablement, stand-in options and BIN tables are configured per range.
- **Separate accounts, cards and tokens,** each with its own state machine, and an account that outlives its cards.
- **Run cards through explicit lifecycle events:** inactive until activated, replacements linked to what they replace, closing that terminates tokens.
- **Decide token provisioning like a payment,** with green only when every signal agrees and ID&V sent only to contact details that predate the request.
- **Keep the PAN and PIN out of your systems,** in the processor's vault and HSM, with vault tokens everywhere else.
- **Fund a crypto-linked card like a JIT program on a slower rail:** convert at authorization at a recorded rate, match every on-chain pull and return to its authorization, and decide which asset a refund returns in before launch.
- **Build the sponsor audit file as you go:** CIP evidence per cardholder, complaints, marketing approvals, alerts and daily balances reconciled to the bank.

## References

**Specifications**

- [CFPB: Regulation E § 1005.18, requirements for financial institutions offering prepaid accounts](https://www.consumerfinance.gov/rules-policy/regulations/1005/18/), short and long form disclosures, the periodic statement alternative (12 and 24 months of history), and no liability limits or error resolution before identity verification
- [CFPB: Regulation E § 1005.6, liability of consumer for unauthorized transfers](https://www.consumerfinance.gov/rules-policy/regulations/1005/6/), the $50 and $500 limits and the 60-day statement window
- [CFPB: Regulation E § 1005.5, issuance of access devices](https://www.consumerfinance.gov/rules-policy/regulations/1005/5/), issuance on request or as a renewal, and unsolicited devices only unvalidated until the consumer's identity is verified
- [CFPB: Regulation Z § 1026.51, ability to pay](https://www.consumerfinance.gov/rules-policy/regulations/1026/51/), ability to make the minimum payments before opening an account or raising a limit, and the rules under 21
- [CFPB: Regulation Z § 1026.12, special credit card provisions](https://www.consumerfinance.gov/rules-policy/regulations/1026/12/), issuance only on request or as a renewal or substitute, the $50 liability cap, and the 10-card business exception
- [CFPB: Regulation Z § 1026.3, exempt transactions](https://www.consumerfinance.gov/rules-policy/regulations/1026/3/), the business-purpose exemption and the commentary keeping §§ 1026.12(a) and (b) for business cards
- [CFPB: Regulation Z § 1026.9, subsequent disclosure requirements](https://www.consumerfinance.gov/rules-policy/regulations/1026/9/), written notice at least 45 days before a significant change in account terms
- [CFPB: Regulation Z § 1026.52, limitations on fees](https://www.consumerfinance.gov/rules-policy/regulations/1026/52/), first-year fees capped at 25% of the initial credit limit
- [CFPB: Regulation Z § 1026.61, hybrid prepaid-credit cards](https://www.consumerfinance.gov/rules-policy/regulations/1026/61/), a hybrid card as a credit card and the 30-day wait after registration
- [Federal Register: Rules Concerning Prepaid Accounts (February 13, 2018)](https://www.federalregister.gov/documents/2018/02/13/2018-01305/rules-concerning-prepaid-accounts-under-the-electronic-fund-transfer-act-regulation-e-and-the-truth), the prepaid rule's April 1, 2019 effective date and agreement submission
- [Cornell LII: 15 U.S.C. § 1693o-2](https://www.law.cornell.edu/uscode/text/15/1693o-2), the Durbin Amendment that Regulation II implements
- [Cornell LII: 12 CFR 235.5, Regulation II exemptions](https://www.law.cornell.edu/cfr/text/12/235.5), the $10 billion small-issuer exemption, the reloadable prepaid exemption and the overdraft and ATM fee exclusions
- [Cornell LII: 31 CFR 1020.220, customer identification programs for banks](https://www.law.cornell.edu/cfr/text/31/1020.220), the written risk-based CIP and the minimum identifying information
- [PCI SSC: Card Production and Provisioning standards update](https://www.pcisecuritystandards.org/about_us/press_releases/pci-security-standards-council-updates-card-production-and-provisioning-security-standard), version 3.0 of the Physical and Logical requirements, January 2022
- [PCI SSC: Card Production bulletin (June 2022)](https://www.pcisecuritystandards.org/wp-content/uploads/2022/06/Card_Production_Bulletin_FINAL.pdf), v3.0.1 as an errata update to v3.0
- [EMVCo: Payment Tokenisation](https://www.emvco.com/emv-technologies/payment-tokenisation/), tokens limited to a merchant, device or use, and registration of token service providers
- [CFPB: Truth in Lending (Regulation Z); Non-application to Earned Wage Access Products (advisory opinion, December 2025)](https://files.consumerfinance.gov/f/documents/cfpb_earned-wage-access-advisory-opinion_2025-12.pdf), covered EWA as not credit under Regulation Z
- [Visa Core Rules and Visa Product and Service Rules, 18 April 2026 (PDF)](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), non-fiat funds converted to fiat before deposit into an account linked to a Visa card, and Visa approval for programs taking previously converted funds (1.4.4.6)
- [IRS: Frequently asked questions on digital asset transactions](https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-digital-asset-transactions), digital assets as property, paying with them as a disposal with capital gain or loss, and stablecoins included
- [IRS: Digital assets](https://www.irs.gov/filing/digital-assets), broker reporting of gross proceeds from January 1, 2025 and basis from January 1, 2026

**Reference**

- [Federal Reserve: Average debit card interchange fee by payment card network](https://www.federalreserve.gov/paymentsystems/regii-average-interchange-fee.htm), 2024 averages of $0.51 for exempt and $0.23 for covered transactions across all networks
- [FDIC: General Counsel's Opinion No. 8 (Federal Register, November 13, 2008)](https://www.govinfo.gov/content/pkg/FR-2008-11-13/pdf/E8-26867.pdf), funds underlying stored value products as deposits, with cardholder coverage depending on pass-through requirements
- [Federal Reserve: Interagency guidance on third-party relationships (June 6, 2023)](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20230606a.htm), planning, due diligence, contracting, monitoring and termination of third-party relationships
- [FDIC: Agencies issue statement on bank arrangements with third parties to deliver deposit products (July 25, 2024)](https://www.fdic.gov/news/financial-institution-letters/2024/agencies-issue-statement-bank-arrangements-third-parties), the joint statement, the bank's undiminished responsibility, and the request for information on bank-fintech arrangements
- [Davis Polk: FinCEN and banking agencies allow banks to collect customers' SSNs from third parties](https://www.davispolk.com/insights/client-update/fincen-and-banking-agencies-allow-banks-collect-customers-ssns-third-parties), the June 27, 2025 CIP order and the Federal Reserve's July 31, 2025 order joining it
- [Morrison Foerster: CFPB reestablishes position that certain earned wage access programs are not "credit"](https://www.mofo.com/resources/insights/260107-cfpb-reestablishes-position-that-certain-earned-wage), the December 23, 2025 opinion's conditions (within earned wages, repaid by payroll deduction, no further recourse, no credit underwriting), fees not finance charges, and state EWA regimes
- [Blue Ridge Bank: Consent order with the OCC (SEC exhibit)](https://www.sec.gov/Archives/edgar/data/842717/000119312524015560/d870968dex101.htm), BSA/AML and third-party risk requirements replacing the 2022 formal agreement
- [Blue Ridge Bankshares: Termination of consent order (November 13, 2025)](https://www.sec.gov/Archives/edgar/data/842717/000119312525280430/brbs-ex99_1.htm), the OCC's termination of the January 24, 2024 order
- [Capital One: Completes acquisition of Brex](https://www.capitalone.com/about/newsroom/capital-one-completes-acquisition-of-brex/), April 7, 2026, and Brex as the integrated corporate card and spend management software
- [Banking Dive: FDIC consent order against Lineage Bank](https://www.bankingdive.com/news/lineage-bank-tennessee-fdic-consent-order-baas-fintech-partner-synapse-synctera/708830/), the January 29, 2024 order, the exit plan for significant fintech partners and approval for new lines of business
- [Ohio Division of Financial Institutions: Sutton Bank consent order (2024)](https://dam.assets.ohio.gov/image/upload/com.ohio.gov/documents/fiin_Enf2024_Sutton%20Bank.pdf), the February 1, 2024 stipulation, the inventory of program managers' AML responsibilities, quarterly reporting, prepaid CIP requirements and the lookback to July 1, 2020
- [Federal Reserve: Enforcement action against Evolve Bancorp and Evolve Bank & Trust (June 14, 2024)](https://www.federalreserve.gov/newsevents/pressreleases/enforcement20240614a.htm), unsafe practices in fintech partnerships, AML and consumer compliance, taken with the Arkansas State Bank Department
- [Visa: Third Party Agent Registration](https://partner.visa.com/site/programs/third-party-agent-registration.html), registration of agents that provide payment services to Visa clients
- [Visa: Visa Account Updater](https://developer.visa.com/capabilities/vau/vau-faq), issuer updates of account numbers, expiry dates, closed accounts and cardholder advices, and enrolling all BINs
- [Visa: Stablecoin-linked cards monetize money movement (March 31, 2026)](https://www.visa.com/en-us/thought-leadership/innovation/stablecoin-linked-cards-monetize-money-movement), more than 130 programs in more than 50 countries, and the traditional and emerging settlement models
- [Visa: Visa brings onchain lending into everyday payments (September 8, 2026)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.22721.html), more than 160 stablecoin-linked card programs and volume growing nearly 200% year over year
- [Visa: Financing stablecoin-linked card programs](https://www.visa.com/en-us/thought-leadership/innovation/financing-stablecoin-linked-card-programs), funding daily settlement before collecting from cardholders, settlement every day including weekends, and Rain as a Visa Principal Member
- [Visa: Visa and Bridge expand stablecoin-linked cards (March 3, 2026)](https://corporate.visa.com/en/sites/visa-perspectives/newsroom/visa-bridge-stablecoin-linked-card-expansion.html), Bridge-enabled cards live in 18 countries
- [Mastercard: Simplified payments card offering for cryptocurrency companies (July 20, 2021, PDF)](https://s25.q4cdn.com/479285134/files/doc_news/Mastercard-Creates-Simplified-Payments-Card-Offering-for-Cryptocurrency-Companies-2021.pdf), crypto entering and settling on the network as fiat
- [Mastercard: Accelerates crypto card partner program (July 22, 2020)](https://newsroom.mastercard.com/news/press/2020/july/mastercard-accelerates-crypto-card-partner-program/), working only with crypto partners that follow its core principles, and Wirex's principal membership

**In practice**

- [Adyen: Issuing](https://docs.adyen.com/issuing), supported in the EEA, UK and US, Visa and Mastercard cards, and authorization requests relayed to your servers
- [Adyen: Account statements](https://docs.adyen.com/business-accounts/compliance-guidelines/account-statements), Adyen N.V. (US: San Francisco Branch) as the card issuer
- [Adyen: Network tokens for digital wallets](https://docs.adyen.com/issuing/tokens-digital-wallet), the risk analysis ending in activation, two-factor authentication, a phone call or closing, and Apple Pay in-app provisioning
- [Adyen: Create cards](https://docs.adyen.com/issuing/create-cards), physical cards starting a manufacturing order, network-approved designs and inactive US cards by default
- [Galileo: Setting up a card program](https://docs.tech.sofi.com/pro/docs/setting-up-a-card-program), embossing vendors, active account and card statuses, and canceled PANs never reactivated
- [Galileo: Authorization Controller API](https://docs.galileo-ft.com/pro/docs/authorization-controller-api), the Auth API webhook for real-time authorization decisions
- [Galileo: Real-time funding scenario](https://docs.galileo-ft.com/pro/page/scenario-18-real-time-funding), funds moved to the card at authorization
- [Galileo: Setup for push provisioning](https://docs.tech.sofi.com/pro/docs/setup-for-push-provisioning), wallet push provisioning and Apple Business Register enrollment in 7 to 10 business days
- [Galileo: Processing partnership with Sutton Bank (2018)](https://tech.sofi.com/news/galileo-processing-partners-with-sutton-bank), Sutton Bank adding Galileo as a processor for open loop prepaid cards
- [SoFi Tech Solutions: Galileo's issuer processor platform receives Visa Ready certification](https://tech.sofi.com/news/galileos-issuer-processor-platform-receives-visa-ready-certification/), Galileo certified as an issuer processor in October 2022
- [i2c: Platform](https://www.i2cinc.com/platform/), issuer processing for credit, debit and prepaid, tokenized wallets and program management support
- [Lithic: Why businesses choose Lithic](https://www.lithic.com/comparison/unit), 25+ sponsor bank integrations, direct network connections and program management
- [Lithic: Auth Stream Access](https://docs.lithic.com/docs/auth-stream-access-asa), custom authorization decisions and a decline after 6 seconds without an answer
- [Lithic: Tokenization decisioning](https://docs.lithic.com/docs/tokenization-control), `APPROVE`, `AUTHENTICATE` or `DECLINE`, the 2.5-second fallback, Mastercard only, and wallet fraud generally not disputable as card-present
- [Lithic: Web push provisioning](https://docs.lithic.com/docs/web-push-provisioning), BINs enabled for digital wallet provisioning
- [Lithic: Bulk shipping physical cards](https://docs.lithic.com/docs/bulk-shipping-physical-cards), the daily issuance file, fulfillment houses and bulk orders
- [Marqeta: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1522540/000152254026000017/mq-20251231.htm), issuing banks as BIN sponsors, $382.5 billion of 2025 volume with 64% settled through Sutton Bank, interchange and revenue share, network fees and incentives, and signature debit interchange above PIN
- [Marqeta: About JIT Funding](https://www.marqeta.com/docs/developer-guides/about-jit-funding), managed and gateway JIT Funding and Commando Mode stand-in
- [Marqeta: Managing tokenization risk](https://www.marqeta.com/docs/developer-guides/mq-eu-managing-tokenization-risk), green, yellow and red flows and ID&V by one-time code, app or call center
- [Marqeta: Managing the digital wallet token lifecycle](https://www.marqeta.com/docs/developer-guides/managing-the-digital-wallet-token-lifecycle), token states, tokens unchanged by card transitions by default, and expired Visa PANs terminating tokens
- [Marqeta: Digital wallets and tokenization](https://www.marqeta.com/docs/developer-guides/digital-wallets-and-tokenization), certification with network token services and tokens exclusive to a wallet and device
- [Marqeta: Managing physical cards](https://www.marqeta.com/docs/developer-guides/managing-physical-cards), the four fulfillment types
- [Payabli: Understanding payables](https://docs.payabli.com/guides/pay-out-payables-overview), Payabli as program manager with the issuing bank for virtual cards, sharing the interchange
- [Payactiv: Visa card](https://www.payactiv.com/card/), the Payactiv Visa Prepaid and Payroll Cards issued by Central Bank of Kansas City
- [Payactiv: Get started](https://payactiv.com/get-started/), real-time EWA transfers free with a qualifying direct deposit of $200 or more per pay period to the Payactiv Card, and a fee that may apply to other instant transfers
- [Ramp: How Ramp makes money](https://support.ramp.com/how-ramp-makes-money), revenue primarily from the card's interchange and Ramp Plus subscriptions, and no interest income because the card is a charge card
- [Crypto.com: US Prepaid Visa cardholder agreement (effective September 1, 2026, PDF)](https://crypto.com/document/us_card.pdf), Community Federal Savings Bank as issuer, Foris, Inc. as program manager, US dollars only on the card, crypto not held at the bank or FDIC-insured, and refunds credited to the card
- [Crypto.com: How do I fund my Crypto.com Visa Card (US)](https://help.crypto.com/en/articles/3131878-how-do-i-fund-my-crypto-com-visa-card-us/), top-ups from crypto with the rate held for 15 seconds
- [Rain: Platform agreement](https://www.rain.xyz/legal/docs/rain-platform-agreement), US Visa debit cards issued by Cross River Bank with Rain as program manager
- [Rain: Introducing real-time funding](https://www.rain.xyz/resources/introducing-real-time-funding), the prefunded collateral contract, and real-time funding committing the amount at authorization until settlement, in beta
- [Rain: Rain Spend support](https://www.rain.xyz/rain-spend-support), spending limits backed by stablecoins in smart contracts, and unpaid balances liquidated from collateral after the 8th
- [Reap: Stablecoin corporate credit cards](https://reap.global/products/cards), issued by Reap as a Visa Principal Member in Hong Kong and Mexico
- [Reap: Funding models](https://docs.reap.global/program-configuration/funding-models.md), user-funded wallets settled on a schedule and program-funded master collateral
- [Reap: Reap and Visa launch stablecoin-linked card programs in 100+ markets (September 23, 2026)](https://reap.global/newsroom/reap-visa-launch-100-markets-stablecoin-card-program), stablecoin-linked Visa credit programs, stablecoin collateral and repayment
- [Stripe: Issuing](https://stripe.com/issuing), the issuing banks by product and program management or processing only
- [Stripe: Charge card terms (Celtic Bank)](https://stripe.com/legal/issuing/celtic-acquiring-receivables-spend-card), the issuing bank extending credit and Stripe as the program manager it appointed
- [Stripe: Set up an Issuing and Connect integration](https://docs.stripe.com/issuing/connect), Connect for cards issued to users who aren't your employees, the expense management example, platform requirements collection and loss liability, and funding the Issuing balance first
- [Stripe: Issuing real-time authorizations](https://docs.stripe.com/issuing/controls/real-time-authorizations), the 2-second response window and network fallback for dedicated BINs
- [Stripe: Use digital wallets with Issuing](https://docs.stripe.com/issuing/cards/digital-wallets.md?platform=ios), manual and push provisioning, Apple approval in one to two weeks, and the payment-pass-provisioning entitlement
- [Stripe: Stablecoin-backed cards for Bridge, Privy, or third-party wallets](https://docs.stripe.com/issuing/bridge-stablecoin-cards), just-in-time pulls at authorization, MCC-based extra pulls and returns, refunds batched on chain, provisional credits to the wallet, Lead Bank terms, the 24-hour KYC rule and the withheld authorization webhook
- [Stripe: Bridge partners with Visa (April 30, 2025)](https://stripe.com/newsroom/news/bridge-partners-with-visa), stablecoin balances converted to fiat at purchase and Lead Bank as the financial institution partner
- [Stripe: Pricing](https://stripe.com/pricing), $0.10 per virtual card and $3.50 per standard physical card in the US
- [The Bancorp: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1295401/000129540126000002/tbbk-20251231x10k.htm), $141.1 million of fintech fees in 2025
