+++
title = "Gig Work & Worker Law"
description = "Worker classification, minimum pay and tip rules, deactivation rights, EU algorithmic management, account renting, rideshare insurance and worker payouts."
category = "User-Generated Platforms Industry"
order = 1839
part = "Peer-to-Peer Marketplaces"
tags = ["gig-work", "worker-classification", "minimum-pay", "deactivation", "platform-work-directive"]
+++

On a gig platform the supply is a person's time. A rideshare driver, a delivery courier, a grocery shopper and a tasker sign up in an app, go online when they choose, receive offers the platform's software picks for them, and are paid per job. Every major US platform treats them as independent contractors, and the law around that choice has stopped being one question. California lets app-based drivers be contractors only while the platform leaves them free to log in when they want and decline any request; New York City, Seattle and Minnesota set minimum pay per minute, mile or hour and prescribe what an offer must show; Seattle, Minnesota and New York City restrict deactivation; the UK Supreme Court held Uber's drivers to be workers because of how the app controlled them; and the EU's Platform Work Directive, due in national law by December 2, 2026, presumes employment when a platform directs and controls the work and regulates the algorithms that do it.

The engineering consequence is that the platform's controls are evidence. An acceptance-rate threshold, a destination hidden until pickup, a rating that ends access, an automated deactivation: each one is a fact a court, a regulator or a statute weighs, and each one is a design decision in the dispatch and trust systems. This chapter covers classification tests in the US, UK and EU, the controls they weigh, minimum pay standards and the clocks they run on, offer and tip transparency, deactivation rights, the EU's algorithmic management rules, worker identity and account renting, rideshare insurance periods and worker payouts. It extends `accounts` and `penalties` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Scheduled, in-home services (pet care, home services, care) are [Services Marketplaces](/books/user-generated-platforms/services-marketplaces), which owns background checks for vetting; the delivery business itself (merchants, menus, orders, dispatch and batching, fees and subscriptions) belongs to the Commerce volume's On-Demand Delivery part; delivery from a merchant's side, including DoorDash Drive and Uber Direct, is the Field Operations volume's [Last-Mile Delivery](/books/field-operations/last-mile-delivery#who-drives).

## How the Platforms Do It

| Platform | Workers as disclosed | What the worker sees before accepting | Acceptance and its consequences | Pay out |
| --- | --- | --- | --- | --- |
| **DoorDash** | "over 9 million people dashed, earning a total of over $20 billion" in 2025 | Minimum guaranteed earnings for the offer, including base pay and the customer's tip, and a deliver-by time | Acceptance rate over the last 100 offers, with "no minimum acceptance rate requirement"; completion below 90% or a customer rating below 4.2 can deactivate; in the opt-in Earn by Time mode, one decline or unassign an hour | Weekly for Monday to Sunday, by Wednesday night; Fast Pay once a day for $1.99; automatic after each dash to the Crimson account |
| **Uber** | Mobility drivers and couriers, collectively "Drivers"; no count in the 10-K | Upfront fare and where the trip goes, with cross streets for pickup and dropoff; tips, tolls and surcharges not included | Not stated on the upfront fares page | Weekly, between Wednesday and Friday; Instant Pay up to six times a day for $1.75 (free and once a day in NYC) |
| **Lyft** | Not counted in the 10-K | Earnings, pickup and drop-off locations, estimated time and distance, and an estimated hourly rate | Not stated on the upfront pay page | Weekly on Tuesdays; Express Pay up to five times in 24 hours for $1.75 |
| **Instacart** | "approximately 600,000 shoppers" | Upfront batch pay, the store and the distance | Not stated on the earnings page | Weekly, Wednesday to Friday for the prior Monday to Sunday; Instant Cashout for a fee |
| **Shipt** | Independent contractors "paid per order" | An estimated pay "based on the time and effort it takes" | Not stated | Weekly on Friday for the prior Monday to Sunday; instant pay three times a day after a first weekly payout |
| **TaskRabbit** | Independent contractors who choose their categories | The task; in most categories the Tasker set the hourly rate | The Tasker chooses categories and minimum hours | Through the platform after the task |

Four patterns:

- **Everyone claims contractor status, and the accounting agrees.** Uber's 10-K concludes it is "an agent" arranging for others to provide the service, with revenue "net of Driver and Merchant earnings"; Lyft says it collects "service fees and commissions from drivers" and acts as principal only in certain markets; DoorDash reports revenue net of Dasher payout. The revenue model and the classification position are the same claim, so a reclassification is also a restatement of what revenue is.
- **The platform sets the price where the worker doesn't.** Uber, Lyft, DoorDash, Instacart and Shipt compute the pay and show it as an offer; TaskRabbit lets Taskers set their own hourly rates in most categories. Who sets the price is the first factor the UK Supreme Court weighed against Uber, and it's the clearest line between an on-demand network and a services marketplace.
- **Offers disclose more than they used to.** Pay, destination and time are on the offer screen at DoorDash, Uber, Lyft and Instacart, and New York City now requires most of it. Part of the reason is legal: a worker who can't see where a trip goes can't meaningfully decline it.
- **Instant pay is a fee product on a weekly cycle.** Every platform pays weekly and sells faster access to the same money for $1.75 to $1.99 a transfer, or gives it free through its own deposit account.

## Classification

Whether a worker is an employee decides minimum wage, overtime, expense reimbursement, unemployment insurance, workers' compensation and the tax form. It's a legal determination for counsel under tests that differ by law and by place; the system's job is to record which status applies to whom, where and when, and to keep the facts each test turns on. The general recording pattern is in the Field Operations volume's [Employee or Contractor](/books/field-operations/sales-teams-and-commissions#employee-or-contractor); this section covers the tests gig platforms meet.

### The US Federal Test, as of October 2026

The Fair Labor Standards Act asks whether the worker is economically dependent on the business. The Department of Labor's 2024 rule (effective March 11, 2024) applies six economic reality factors: opportunity for profit or loss, investments, permanence, control, whether the work is integral, and skill and initiative. Field Assistance Bulletin 2025-1 (May 1, 2025) says the Wage and Hour Division no longer applies the 2024 rule's analysis in investigations and enforces under Fact Sheet 13 (July 2008) and a 2019 opinion letter, while "the 2024 Rule remains in effect for purposes of private litigation." On February 26, 2026 the Department proposed replacing the test with the analysis of the January 2021 rule, with changes, and extending it to the FMLA and MSPA; comments closed April 28, 2026. As of October 2026 no final rule has followed, so the federal test depends on who is asking: the agency or a private plaintiff.

### ABC Tests and AB5

State law is often stricter. California's AB 5 (2019, Labor Code sections 2775 to 2787) presumes employment unless the hiring entity proves all three parts of the ABC test: the worker is free from its control "both under the contract for the performance of the work and in fact"; the work is "outside the usual course of the hiring entity's business"; and the worker is "customarily engaged in an independently established trade, occupation, or business of the same nature." Part B is the one an on-demand platform struggles with, because rides and deliveries are what the platform sells.

### Proposition 22 and Castellanos

California voters answered AB 5 for app-based drivers with Proposition 22 (2020, Business and Professions Code section 7448 and following). Section 7451 makes an app-based driver an independent contractor if four conditions hold:

1. The network company doesn't unilaterally prescribe dates, times of day or a minimum number of hours the driver must be logged in.
2. It doesn't require the driver to accept any specific rideshare or delivery request as a condition of keeping access.
3. It doesn't restrict the driver from working through other network companies, except during engaged time.
4. It doesn't restrict the driver from any other lawful occupation or business.

In exchange the network company owes an earnings floor, a health care subsidy, occupational accident insurance, a written contract that can be terminated only on grounds it states (with an appeals process), anti-discrimination and sexual harassment policies, background checks, safety training and a 12-hour driving limit in any 24 hours. In *Castellanos v. State of California* (July 25, 2024), the California Supreme Court unanimously upheld section 7451, holding that the constitution's grant of workers' compensation power to the Legislature doesn't stop voters from legislating on it by initiative.

The design consequence is literal. Condition 2 is why a California rideshare or delivery platform can show an acceptance rate but can't make access depend on it, and condition 1 is why scheduling features must stay optional. Those conditions are rules on the dispatch system's behavior, and an engineer changing how declines are handled is changing whether the statute's contractor status applies.

### The UK: Uber BV v Aslam

In *Uber BV v Aslam* [2021] UKSC 5 (February 19, 2021), the UK Supreme Court upheld the finding that Uber's London drivers were workers, entitled to the minimum wage and paid leave, and that time logged into the app in London and available to accept trips is working time. The court looked past the contracts to five facts about control (paragraphs 94 to 100):

- **Uber fixed the fare,** and drivers couldn't charge more.
- **Uber dictated the contract terms.**
- **Uber constrained acceptance,** by not telling drivers the passenger's destination until pickup, and by monitoring acceptance and cancellation rates, warning drivers who fell below them and logging them off for ten minutes, a measure Uber's own document called a "penalty."
- **Uber controlled how the service was delivered,** vetting vehicle types and directing the route through the app, and used passenger ratings to warn and ultimately end the relationship with drivers.
- **Uber restricted communication** between passenger and driver to the trip, through the app, so no relationship could form beyond one ride.

Every item on that list is a product feature. The judgment is the clearest public statement of how a platform's software becomes evidence of control.

### The EU Platform Work Directive

Directive (EU) 2024/2831 of October 23, 2024, on improving working conditions in platform work, entered into force December 1, 2024; member states must transpose it by December 2, 2026. Its classification rules:

- **Correct determination (Article 4).** Status is decided primarily by how the work is actually performed, including the use of automated systems, not by the label in the contract.
- **A rebuttable presumption of employment (Article 5).** The relationship is "legally presumed to be an employment relationship" when facts indicating direction and control are found, and the platform bears the burden of proving otherwise. The presumption applies in proceedings on employment status but not, by default, in tax, criminal or social security proceedings, which member states may extend it to.
- **Declaration of platform work (Article 16).** Platforms declare work performed by platform workers to the authorities of the member state where it's performed.

The facts that trigger the presumption are left to national law. Spain already had one: its 2021 Ley Rider (Real Decreto-ley 9/2021, later Ley 12/2021) presumes that delivery through digital platforms that exercise control directly, indirectly or implicitly through algorithmic management is employment, and gives works councils the right to be told the parameters, rules and instructions behind the algorithms that affect working conditions. As of October 2026, transposition of the directive elsewhere is in progress (Ireland, for one, consulted publicly in 2025); I haven't found a reliable public tracker of national status, so check each market's law before launch.
<!-- source-gap: pwd-transposition-status | missing | member state transposition status of Directive (EU) 2024/2831 | closes with: an official Commission or member state transposition notice per market | checked: 2026-10-28 -->

## Controls Are Evidence

A platform's controls exist for good reasons: reliability, safety, fraud, service quality. The tests above don't forbid them; they weigh them. My rule is to treat each control as a documented decision with a stated purpose, an owner, a jurisdiction scope and a change history, because the question "did you require acceptance?" will be answered from the system, not the policy page.

| Control | Why platforms use it | Where the law weighs it |
| --- | --- | --- |
| **Acceptance rate thresholds** | Reliable dispatch | Aslam (a "penalty"); Prop 22 section 7451(b); Seattle's right not to be penalized for refusing offers |
| **Hiding the destination or pay until acceptance** | Prevent cherry-picking | Aslam; NYC and Seattle offer disclosures |
| **Ratings that end access** | Service quality | Aslam; deactivation laws requiring reasonable, disclosed policies |
| **Routing directions and time targets** | Delivery times | Aslam; EU Article 12 on undue pressure |
| **Scheduling, shifts and minimum hours** | Supply guarantees | Prop 22 section 7451(a) |
| **Exclusivity or limits on multi-apping** | Supply guarantees | Prop 22 section 7451(c) |
| **Automated deactivation** | Fraud and safety at scale | Seattle, Minnesota and NYC procedures; EU Article 10(5): decisions to restrict, suspend or terminate "shall be taken by a human being" |

Platforms have moved in the direction this table implies. DoorDash shows an acceptance rate but states there's "no minimum acceptance rate requirement," using it instead toward a rewards tier; Uber and Lyft show the destination on the offer; and the Earn by Time mode that limits declines to one an hour is an opt-in mode the Dasher chooses, alongside the default per-offer pay. Whether those choices are enough under any given test is for counsel; what the system owes counsel is a record of exactly what the control did, to whom, when and in which jurisdiction ([Rules as Data](/docs/architecture/rules-as-data#record-which-rule-decided)).

## Minimum Pay Standards

| Jurisdiction | Who | Standard | Rate | Measured over |
| --- | --- | --- | --- | --- |
| **California** (Prop 22) | App-based rideshare and delivery drivers | 120% of the applicable minimum wage for engaged time, plus a per-mile amount for engaged miles | $0.37 per engaged mile in 2026, CPI-adjusted from $0.30 in 2021 | Each earnings period (at most 14 days), topped up by the next |
| **New York City** | Restaurant and grocery app delivery workers | Hourly minimum, before tips | $22.13 an hour for pay periods from April 1, 2026 | Each pay period; standard or alternative method |
| **Seattle** (PayUp, SMC 8.37) | App-based workers | The greater of per-minute plus per-mile, or a per-offer minimum | $0.47 a minute and $0.80 a mile, or $5.34 an offer, in 2026 | Each offer |
| **Minnesota** (Minn. Stat. 181C.03) | Rideshare drivers (passenger service only) | Per mile and per minute while a passenger is in the vehicle, with a per-ride minimum | $1.28 a mile, $0.31 a minute, $5.00 a ride since December 1, 2024; $1.33, $0.32 and $5.20 from January 1, 2027 | Each ride |
| **New York State and Massachusetts** | Rideshare drivers | Minimum guaranteed earnings and benefits under agreements with the Attorneys General | See below | Under each agreement |

Lyft's 10-K reports agreements with the New York and Massachusetts Attorneys General that require minimum guaranteed earnings and benefits, and names California, New York, Washington, Massachusetts and Minnesota as markets where earnings standards raised prices. I couldn't open the Massachusetts Attorney General's published terms, so the table leaves the Massachusetts rate out rather than repeat it from secondary reporting. Massachusetts voters separately approved Question 3 in 2024, letting rideshare drivers form a union, 1,771,750 to 1,504,674.
<!-- source-gap: ma-ag-rideshare-settlement | secondary | Massachusetts AG settlement with Uber and Lyft: hourly minimum for engaged time, its 2026 value and benefits | closes with: the mass.gov settlement press release and FAQ opened directly | checked: 2026-10-28 -->

### Engaged Time and Its Clocks

The standards look alike and measure different clocks, which is the engineering problem:

- **California's engaged time** runs from when the driver accepts a request to when they complete it, as recorded in the app. Waiting online isn't engaged time. Net earnings exclude tips, tolls, cleaning fees, airport fees and other pass-throughs but may include incentives. The floor is computed per earnings period, may be met on average across the period, and any shortfall is paid "no later than during the next earnings period."
- **New York City** separates trip time (from accepting an offer to completing or cancelling the trip) from on-call time (connected and able to receive offers). Under the standard method each worker earns at least the rate times their trip time, and the app's payments in aggregate cover the rate times all trip and on-call time; under the alternative method each worker earns the rate divided by 60% times trip time, allowed only when the app's utilization (trip time over trip plus on-call time, across all its workers) is above 53%. Tips can't count toward the minimum.
- **Seattle** pays per offer: the per-minute and per-mile amounts for the offer, or the per-offer minimum if greater.
- **Minnesota** counts only time and miles with a passenger in the vehicle.

So a minimum pay engine needs, per worker, a timeline of states (offline, online and available, en route to pickup, with passenger or order, completed or cancelled) with timestamps and distances, from which each jurisdiction's clock is a query. It computes the floor per period and per standard, compares it with what the worker earned under the standard's own definition of earnings, and pays a top-up line that names the standard it satisfies. The rates are effective-dated data ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)): California's mileage figure changes every January, New York City announces its rate by February 1 for April, and Seattle's and Minnesota's index on their own schedules.

## Offers and Pay Transparency

The offer screen is where classification, minimum pay and transparency law meet. Uber drivers see "how much you'll make and where you'll go before accepting a request"; Lyft shows the earnings, pickup and drop-off, estimated time and distance and an estimated hourly rate; DoorDash shows minimum guaranteed earnings including the tip; Instacart shows upfront pay, the store and distance.

Law now fixes the contents in some places:

- **New York City** requires a restaurant or grocery app's offer to show the pickup address and drop-off location, the estimated time and routed distance and the route used, the tip the customer selected, and the pay or hourly rate excluding tips (plus, for restaurant apps, the direct distance from first pickup to final drop-off), and to pay at least the amount offered, including the tip unless the customer changes it.
- **Seattle** gives app-based workers a right to upfront disclosure of offer information, and to receipts and payment records.
- **Colorado** (SB24-075, effective August 7, 2024) requires rideshare companies to disclose to drivers what consumers pay, and to adopt a deactivation and suspension policy by May 1, 2025.

How offers are generated (dispatch, batching, ETA prediction and dynamic pricing) belongs to the Commerce volume's On-Demand Delivery part. Where it touches this chapter is the record: each offer is stored with what was shown, the rule that required it, and the worker's response, because the offer is the evidence for minimum pay, for tip pass-through and for whether a decline carried a consequence.

## Tips

The rule everywhere is the same: the tip belongs to the worker and doesn't fund the platform's share of their pay. Prop 22 says no network company may "take, receive, or retain any gratuity" or reduce earnings on account of one, and must pay card tips in full without deducting processing fees. New York City forbids counting tips toward the minimum and, since January 26, 2026, requires restaurant and grocery apps to offer tip options of at least 10% and a custom amount at or before checkout; a 2022 local law already barred soliciting a tip without disclosing how it's handled. DoorDash, Instacart and Shipt each say workers keep 100% of tips.

The enforcement record explains the rule. The District of Columbia Attorney General's $2.5 million settlement with DoorDash (November 24, 2020) found that, from July 2017 to September 2019, "tips were used to subsidize DoorDash's payments to its workers"; DoorDash had since revised the policy. Its 2022 settlement with Instacart ($2.54 million) concerned a service fee presented as if it were a tip from 2016 to 2018.

What the rule does to the system:

- **A tip is its own line, payer to worker,** never netted against base pay, and never in the platform's revenue ([Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers) covers payee balances).
- **The tip shown in the offer is a commitment.** Instacart lets customers raise a tip for up to 14 days but not lower it after 2 hours; New York City requires paying at least the offered tip unless the customer changes it. A tip change is a dated event on the job, not an edit.
- **Base pay doesn't depend on the tip.** If an algorithm lowers base pay when the tip is high, the tip is subsidizing pay, the pattern the DC settlement describes.
- **The customer-facing label is accurate.** A fee isn't called or shown like a tip.

## Deactivation

Deactivation ends a worker's access to their income, and several jurisdictions now regulate it like a dismissal:

- **California** (Prop 22 section 7452): a written agreement, termination only on grounds it specifies, and an appeals process.
- **Seattle** (SMC 8.40, effective January 1, 2025): policies must be reasonably related to safe and efficient operations; before deactivating, the company gives fair notice of the policy, investigates fairly and objectively, applies it consistently and proportionately; for egregious misconduct it may deactivate immediately but must finish the investigation within 14 days; it responds to a challenge within 14 days with a response certified by someone with authority to reinstate; and workers get access to the records substantiating the decision. Seattle's labor office enforces the procedures now and may investigate whether a deactivation was justified from June 1, 2027.
- **Minnesota** (Minn. Stat. 181C.04): a written, plain-language deactivation policy; notice at the time of deactivation or within three days for serious misconduct; an appeal window of at least 30 days and a final decision within 15 days; and no deactivation for a driver's good-faith statement about pay or working conditions.
- **New York City**: Local Law 52 of 2026 covers high-volume for-hire (rideshare) drivers from July 28, 2026; Local Law 34 of 2026 bars deactivating delivery workers except for just cause or bona fide economic reasons from January 17, 2027, with reinstatement and lost earnings as remedies. Apps must already pay for all completed deliveries before deactivating, and a retaliatory deactivation costs $500 to $2,500 plus lost earnings.
- **The EU** (Directive 2024/2831, Article 10(5) and Article 11): a decision to restrict, suspend or terminate the account must be taken by a human being, and the worker gets a written statement of reasons and a right to review.

Platform thresholds are the inputs these laws scrutinize: DoorDash, for example, can deactivate for a completion rate below 90% or a customer rating below 4.2. A deactivation is a penalty in the volume's model, issued by a moderation decision with a policy, evidence and appeal ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders); [Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing)). The gig additions are a notice with jurisdiction-specific deadlines, a human decider where law requires one, the substantiating records available to the worker, earnings paid out before access ends, and reinstatement with back pay as a possible outcome of an appeal.

## Algorithmic Management Under the EU Directive

Chapter III of Directive 2024/2831 governs automated monitoring and decision-making systems. Articles 7 to 11 protect every person performing platform work, whatever their contract (Article 7 from recruitment on); Articles 12 to 14 protect platform workers in an employment relationship:

- **Prohibited processing (Article 7).** No processing of data on a worker's emotional or psychological state or their private conversations; no collection while they aren't offering or performing platform work; no predicting the exercise of fundamental rights such as organizing; no inferring racial or ethnic origin, migration status, political opinions, religion, disability, health, union membership or sexual orientation; and no processing of biometric data to establish identity by comparison with stored biometric data in a database.
- **Transparency (Article 9).** Workers, their representatives and, on request, authorities are told which automated systems are used, what they monitor and why, the main parameters decisions take into account and their relative importance, and the grounds for restricting, suspending or terminating an account.
- **Human oversight (Article 10).** The impact of automated decisions is evaluated regularly, at least every two years, with workers' representatives involved, and decisions to restrict, suspend or terminate are taken by a human.
- **Explanation and review (Article 11).** Workers can obtain an explanation of any decision taken or supported by automated systems, and a written statement of reasons for restrictions, suspensions and terminations.
- **Health and safety (Article 12).** For platform workers, automated systems may not be used in a way that puts undue pressure on them or endangers their health.

Two of these reach directly into design. Article 7(1)(c) means location and activity tracking stops when the worker is offline, which is a collection rule in the app, not a retention rule on the server. Article 9 and Article 11 mean every automated decision about a worker (an offer's pay, a priority tier, a warning, a flag for review) must be traceable to a named system, version and main parameters, which is the [Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions) record with a worker-facing explanation on top.

## Worker Identity and Account Renting

The identity check at onboarding ([Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding)) proves who signed up, not who is working today. Accounts get shared, rented or sold to people who couldn't pass the check, which defeats the background check, the insurance and the customer's trust. Platforms answer with repeated liveness checks:

- **DoorDash** reported in December 2024 that over 150,000 Dashers complete selfie checks every week, triggered by login anomalies, suspicious patterns and inconsistent or repeated account details, including mid-dash right after a delivery; a Dasher who can't or won't re-verify can't continue.
- **Uber** prohibits account sharing and renting in its Community Guidelines, prompts couriers for selfies when going online or between trips, and blocks a mismatched account from going online pending review and possible deactivation.

California makes impersonating an app-based driver while providing services a misdemeanor (Prop 22 section 7462). In the EU, a selfie re-check is an automated system under Chapter III; whether a one-to-one match against the worker's own enrolment photo falls within Article 7's ban on identification against a database of stored biometric data is a question for counsel and for each country's transposition, and a failed match is a restriction that needs a human decision under Article 10(5). Background checks and other vetting before work starts are in [Services Marketplaces](/books/user-generated-platforms/services-marketplaces) and [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud#sanctions-screening-and-background-checks).

Model a re-check as a verification of its own with its trigger, method, result and the human decision on any failure; link it to the session it gated; and treat repeated failures across accounts sharing a device or payout account as a linked-account signal ([Linked Accounts](/books/user-generated-platforms/marketplace-fraud#linked-accounts)).

## Rideshare Insurance Periods

Rideshare insurance is defined by the driver's app state, which makes the timeline a coverage record. California's Public Utilities Commission sets the model most states follow:

| Period | App state | Required coverage in California |
| --- | --- | --- |
| **0** | App off | The driver's personal auto policy |
| **1** | App open, waiting for a match | $50,000 per person and $100,000 per incident for death and injury, $30,000 property damage, plus $200,000 excess per occurrence |
| **2** | Match accepted, passenger not yet picked up | $1,000,000 primary commercial liability |
| **3** | Passenger in the vehicle until they exit | $1,000,000 primary, plus $1,000,000 uninsured and underinsured motorist coverage |

Uber and Lyft publish the same three periods nationally: $50,000, $100,000 and $25,000 liability while waiting (where personal insurance doesn't apply) and at least $1,000,000 en route and on trip, with contingent collision and comprehensive at a $2,500 deductible; Lyft notes lower en-route limits in Maryland and Arizona. Prop 22 adds occupational accident insurance for California drivers while online: medical expenses up to at least $1,000,000 and disability payments of 66% of average weekly earnings.

A claim asks one question first: which period was the driver in at the moment of the accident? The answer comes from the same state timeline that minimum pay uses, so keep it once, keep it immutable, and record the coverage in force for each period with its policy and insurer. How marketplaces sell and broker protection is in [Insurance Law: Who May Sell It](/books/user-generated-platforms/deposits-and-protection#insurance-law-who-may-sell-it).

## Worker Payouts

Gig payouts are the marketplace payouts of [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#schedules-minimums-and-instant-payouts) with three differences:

- **Law sets the cycle.** Prop 22's earnings period is at most 14 days; New York City requires delivery workers be paid at least weekly, within seven days of the period's end, with an itemized pay statement naming the pay method used. A platform's weekly cycle is a legal maximum in those places, not just a product default.
- **Instant pay is constant.** Every major platform sells same-day access: DoorDash Fast Pay ($1.99, once a day, to a non-prepaid debit card), Uber Instant Pay ($1.75, up to six times a day and $3,000 a cashout), Lyft Express Pay ($1.75, five times in 24 hours), Instacart Instant Cashout and Shipt instant pay. Some move workers to their own deposit accounts with free transfers after each shift: DoorDash Crimson, held at Starion Bank, and the shopper card Instacart announced in 2025 with Lead Bank. These are prefunded advances on unsettled money ([Instant Payouts From a Prefunded Balance](/books/payments/vendor-payouts#instant-payouts-from-a-prefunded-balance); [Push to Card](/books/payments/vendor-payouts#push-to-card)), and the terms vary by place: Uber's Instant Pay is free but limited to once a day in New York City.
- **Every payout line names its source.** Base pay, the minimum pay top-up and the standard it satisfies, incentives, tips and reimbursements (tolls) are separate lines, because each standard counts a different subset as earnings and tips must pass through whole.

Tax reporting follows the payee. Platforms report contractor earnings on federal information returns under the thresholds described in [Information Returns: 1099-K, 1099-MISC and 1042-S](/books/user-generated-platforms/paying-creators-and-sellers#information-returns-1099-k-1099-misc-and-1042-s); Prop 22 adds a California information return for app-based drivers with $600 or more in a year, filed with the Franchise Tax Board whether or not a federal one is due.

## How to Build It

```sql
CREATE TABLE worker_classifications (    -- the status that applies, where and when
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  jurisdiction  TEXT NOT NULL,           -- 'US-CA', 'US-NY-NYC', 'GB', 'ES'
  status        TEXT NOT NULL CHECK (status IN ('contractor', 'statutory_contractor',
                  'worker', 'employee')),  -- statutory: Prop 22; worker: UK limb (b)
  basis         TEXT NOT NULL,           -- 'ca_bp_7451', 'abc_test', 'agency_employer'
  decided_by    UUID REFERENCES accounts (id),  -- counsel or HR, for an individual decision
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (account_id WITH =, jurisdiction WITH =, valid_during WITH &&)
);

CREATE TABLE worker_states (             -- the timeline every clock and coverage reads
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  state         TEXT NOT NULL CHECK (state IN ('online', 'en_route', 'engaged')),
  job_id        UUID,                    -- worker_jobs, for en_route and engaged
  during        TSTZRANGE NOT NULL,
  distance_m    INT,                     -- metres driven in the state
  subdivision   TEXT NOT NULL,           -- ISO 3166-2 where the state began; city in city_code
  city_code     TEXT,
  insurance_period SMALLINT NOT NULL CHECK (insurance_period IN (1, 2, 3)),
  policy_ref    TEXT,                    -- coverage in force for the period
  EXCLUDE USING GIST (account_id WITH =, during WITH &&)
);

CREATE TABLE worker_offers (             -- what the worker was shown, and what they did
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  subject_type  TEXT NOT NULL,           -- 'ride', 'delivery_order', 'shop_batch', 'booking'
  subject_id    UUID NOT NULL,
  shown_pay     BIGINT NOT NULL,         -- excluding tip, minor units
  shown_tip     BIGINT,                  -- null where the tip isn't known at offer
  currency      CHAR(3) NOT NULL,
  shown_fields  JSONB NOT NULL,          -- pickup, dropoff, est minutes and distance, route
  disclosure_rule TEXT NOT NULL,         -- 'nyc_dcwp', 'seattle_8_37', 'default'
  pay_model_version TEXT NOT NULL,       -- the system that priced the offer
  offered_at    TIMESTAMPTZ NOT NULL,
  response      TEXT CHECK (response IN ('accepted', 'declined', 'expired', 'unassigned')),
  responded_at  TIMESTAMPTZ,
  consequence   TEXT                     -- null, or what a decline did: 'none', 'mode_ended'
);

CREATE TABLE worker_jobs (               -- an accepted offer, through completion
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  offer_id      UUID NOT NULL UNIQUE REFERENCES worker_offers (id),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  status        TEXT NOT NULL CHECK (status IN ('accepted', 'in_progress', 'completed',
                  'cancelled_by_worker', 'cancelled_by_customer', 'cancelled_by_platform')),
  accepted_at   TIMESTAMPTZ NOT NULL,
  started_at    TIMESTAMPTZ,             -- pickup: passenger in, order collected
  ended_at      TIMESTAMPTZ
);

CREATE TABLE pay_standards (             -- minimum pay rules, effective-dated
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT NOT NULL,           -- 'ca_prop22', 'nyc_delivery', 'seattle_payup', 'mn_181c'
  jurisdiction  TEXT NOT NULL,
  worker_kind   TEXT NOT NULL,           -- 'rideshare', 'restaurant_delivery', 'grocery_delivery'
  measure       TEXT NOT NULL CHECK (measure IN ('per_period', 'per_offer', 'per_ride')),
  clock         TEXT NOT NULL,           -- which worker_states count: 'engaged', 'en_route+engaged'
  rates         JSONB NOT NULL,          -- {"min_wage_pct": 120, "per_mile": 37} or per-minute, per-offer
  excludes      TEXT[] NOT NULL,         -- earnings line kinds that don't count: {'tip','toll'}
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (code WITH =, valid_during WITH &&)
);

CREATE TABLE pay_floor_checks (          -- one standard, one worker, one period
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  standard_id   UUID NOT NULL REFERENCES pay_standards (id),
  period        TSTZRANGE NOT NULL,      -- or one offer's span for per-offer standards
  clock_seconds INT NOT NULL,
  clock_meters  INT NOT NULL,
  counted_earnings BIGINT NOT NULL,      -- by the standard's own definition
  floor_amount  BIGINT NOT NULL,
  top_up        BIGINT NOT NULL CHECK (top_up >= 0),
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, standard_id, period)
);

CREATE TABLE worker_earnings (           -- the pay lines; tips never netted
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  job_id        UUID REFERENCES worker_jobs (id),
  floor_check_id UUID REFERENCES pay_floor_checks (id),
  kind          TEXT NOT NULL CHECK (kind IN ('base', 'tip', 'incentive', 'top_up',
                  'reimbursement', 'adjustment')),
  amount        BIGINT NOT NULL,
  currency      CHAR(3) NOT NULL,
  pay_period    DATERANGE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'top_up') = (floor_check_id IS NOT NULL))
);

CREATE TABLE tip_changes (               -- the tip as offered, then every change
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  job_id        UUID NOT NULL REFERENCES worker_jobs (id),
  amount        BIGINT NOT NULL CHECK (amount >= 0),
  changed_by    TEXT NOT NULL CHECK (changed_by IN ('customer', 'platform_correction')),
  changed_at    TIMESTAMPTZ NOT NULL
);

CREATE TABLE worker_controls (           -- every control that bears on status, documented
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT NOT NULL,           -- 'acceptance_rate_display', 'earn_by_time_decline_limit'
  version       INT NOT NULL,
  purpose       TEXT NOT NULL,
  jurisdictions TEXT[] NOT NULL,         -- where it's on
  parameters    JSONB NOT NULL,          -- thresholds, windows
  approved_by   UUID NOT NULL REFERENCES accounts (id),
  valid_during  TSTZRANGE NOT NULL,
  UNIQUE (code, version)
);

CREATE TABLE automated_decisions (       -- EU Articles 9 and 11: system, version, reasons
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  system        TEXT NOT NULL,           -- 'offer_pricing', 'identity_recheck', 'quality_flag'
  system_version TEXT NOT NULL,
  decision      TEXT NOT NULL,
  main_parameters JSONB NOT NULL,        -- what the explanation is built from
  human_reviewer UUID REFERENCES accounts (id),
  penalty_id    UUID REFERENCES penalties (id),
  decided_at    TIMESTAMPTZ NOT NULL,
  CHECK (penalty_id IS NULL OR human_reviewer IS NOT NULL)  -- restrictions need a person
);

CREATE TABLE identity_rechecks (         -- who is working now, not who signed up
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  verification_id UUID REFERENCES verifications (id),
  trigger       TEXT NOT NULL CHECK (trigger IN ('go_online', 'mid_shift', 'login_anomaly',
                  'linked_account', 'random')),
  worker_state_id UUID REFERENCES worker_states (id),
  result        TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'abandoned')),
  automated_decision_id UUID REFERENCES automated_decisions (id),
  checked_at    TIMESTAMPTZ NOT NULL
);

ALTER TABLE penalties                    -- deactivation as a penalty, with its procedure
  ADD COLUMN deactivation_rule TEXT,     -- 'seattle_8_40', 'mn_181c_04', 'nyc_ll34_2026'
  ADD COLUMN notice_due_at     TIMESTAMPTZ,
  ADD COLUMN notice_sent_at    TIMESTAMPTZ,
  ADD COLUMN records_shared_at TIMESTAMPTZ,  -- substantiating records given to the worker
  ADD COLUMN appeal_due_at     TIMESTAMPTZ,  -- the platform's deadline to decide
  ADD COLUMN reinstated_at     TIMESTAMPTZ,
  ADD COLUMN back_pay_amount   BIGINT;
```

Design decisions behind it:

- **One timeline, many clocks.** `worker_states` is the single record of online, en route and engaged time with distance and place; California's engaged time, New York City's trip and on-call time, Seattle's per-offer minutes and Minnesota's passenger time are each a query over it, and so is the insurance period. Write it once, never edit it, and correct it with an adjustment line.
- **Standards are data, checks are records.** `pay_standards` carries rates, the clock and what doesn't count as earnings, effective-dated; each `pay_floor_checks` row shows the clock, the counted earnings, the floor and the top-up, so a regulator's audit or a worker's complaint is answered by a row, not a recomputation under today's rates.
- **The offer is evidence.** `worker_offers` keeps exactly what was shown, the disclosure rule applied, the pay model version and the response with any consequence. It's what proves an offered tip was paid, a decline wasn't penalized, and the offer met New York City's disclosure list.
- **Tips are a line and a history.** A tip is its own `worker_earnings` line, never netted against base pay, and every change after the offer is a dated row.
- **Controls are versioned decisions.** `worker_controls` records each control that bears on classification with its purpose, parameters, jurisdictions and approver, so the answer to "what did the app require of drivers in California in March?" is a query.
- **Restrictions need a person.** A penalty linked to an automated decision requires a human reviewer, which is EU Article 10(5) as a constraint rather than a policy.
- **Deactivation is a penalty with a procedure.** The jurisdiction's rule sets the notice, appeal and records deadlines, computed and stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), with reinstatement and back pay as outcomes.
- **Classification is effective-dated per jurisdiction.** The same account can be a statutory contractor in California, a worker in London and presumed an employee in Spain.
- **Events:** `worker.state_changed`, `offer.shown`, `offer.responded`, `job.completed`, `tip.changed`, `pay_floor.checked`, `deactivation.issued` and `deactivation.appealed` drive payroll, notices and reporting through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Pay floor compliance:** every check per worker, period and standard with its clock, counted earnings, floor and top-up, and the rates version used.
- **Offers:** what each offer showed, under which disclosure rule, the response, and whether any consequence followed a decline, sampled by jurisdiction.
- **Tips:** offered tip versus paid tip per job, with every change, and proof that no base pay model takes the tip as an input where that's prohibited.
- **Controls:** each control's versions, parameters, jurisdictions and approver, and which workers it touched.
- **Deactivations:** notice, records shared, human decider, appeal and outcome against each jurisdiction's deadlines, plus counts by reason.
- **Automated decisions:** system, version and main parameters for each decision about a worker, and the explanations given on request.
- **Identity rechecks:** triggers, results and the human decision on every failure.
- **Insurance periods:** the period and policy in force at any timestamp for any driver.

## Tradeoffs and When Not To

- **Employment is a choice, not only a risk.** A platform can employ its workers, trading flexibility and cost for certainty, and the directive's presumption makes that trade more attractive. A platform that schedules shifts, sets routes and requires acceptance is building an employer's controls; at that point modeling employees, rosters and payroll is the honest design ([Technician Workforce](/books/field-operations/technician-workforce)).
- **Flexibility costs dispatch quality.** No acceptance requirement, visible destinations and free multi-apping make supply less predictable, and the platform pays for it in incentives and wait times. That's the price of contractor status under Prop 22 and in Aslam's reasoning; pretending it isn't is how controls creep back in.
- **Per-jurisdiction rules multiply.** Each city's standard needs its own clock, rates, offer fields and deactivation procedure. My default is one engine with the strictest common behavior on (disclose destination and pay, pass tips through, give notice and human review before deactivation) and jurisdiction-specific rates on top, rather than a different product per city.
- **A services marketplace with worker-set prices is different.** Where workers set their own rates, choose their categories and build their own clientele, as TaskRabbit describes, many of these controls don't exist; [Services Marketplaces](/books/user-generated-platforms/services-marketplaces) covers that model.

## What This Means for the System You Build

- **Treat every control as evidence** of direction and control: document its purpose, version, parameters and jurisdictions, and know which test weighs it.
- **Keep one immutable worker timeline** (online, en route, engaged, with time, distance and place) and derive every pay clock and insurance period from it.
- **Make minimum pay standards data** and record each period's check with clock, counted earnings, floor and top-up.
- **Store every offer as shown,** with the disclosure rule, the pay model version, the response and any consequence.
- **Pass tips through whole** as their own lines, honor the offered tip, and keep base pay independent of it.
- **Run deactivation as a penalty with a procedure:** jurisdiction deadlines, records shared, a human decider, appeal, reinstatement and back pay.
- **Log automated decisions about workers** with system, version and main parameters, and stop collecting data when the worker goes offline.
- **Re-check identity during work,** not only at sign-up, with a human decision on every failure.
- **Pay on the legal cycle,** itemize each pay line by source, and keep instant pay terms per jurisdiction.

## References

**Law and regulation**

- [U.S. Department of Labor: Independent contractor rulemaking](https://www.dol.gov/agencies/whd/flsa/misclassification/rulemaking), the 2024 rule's dates and the February 26, 2026 proposal
- [U.S. Department of Labor: Field Assistance Bulletin 2025-1 (PDF)](https://www.dol.gov/sites/dolgov/files/WHD/fab/fab2025-1.pdf), enforcement under Fact Sheet 13 and the 2024 rule in private litigation
- [U.S. Department of Labor: Fact Sheet 13](https://www.dol.gov/agencies/whd/fact-sheets/13-flsa-employment-relationship), the economic reality factors
- [Federal Register: Independent contractor proposed rule (API record)](https://www.federalregister.gov/api/v1/documents/2026-03962.json), publication February 27, 2026, the return to the 2021 analysis and the April 28, 2026 comment deadline
- [California DIR: Independent contractor versus employee](https://www.dir.ca.gov/dlse/faq_independentcontractor.htm), AB 5 and the three parts of the ABC test
- [California Secretary of State: Proposition 22, text of proposed laws (PDF)](https://vig.cdn.sos.ca.gov/2020/general/pdf/topl-prop22.pdf), sections 7451 to 7464.5: contractor conditions, earnings floor, engaged time, tips, health subsidy, occupational accident insurance, termination, impersonation, driving limit, state information return
- [California State Treasurer: Proposition 22 per-mile rate](https://www.treasurer.ca.gov/prop-22.asp), $0.37 per engaged mile for 2026 and prior years
- [California Supreme Court: Castellanos v. State of California, S279622 (PDF)](https://www4.courts.ca.gov/opinions/archive/S279622.PDF), July 25, 2024, section 7451 upheld
- [NYC DCWP: Delivery worker laws FAQs](https://www.nyc.gov/site/dca/workers/workersrights/food-delivery-worker-laws-faqs.page), the $22.13 rate, standard and alternative methods, utilization, offer disclosures, tips, weekly pay, deactivation payment and retaliation
- [NYC DCWP: Landmark delivery worker protections take effect](https://www.nyc.gov/site/dca/news/009-26/major-victory-nyc-delivery-workers-landmark-protections-take-effect-today), January 26, 2026, grocery workers covered, tipping and transparency laws
- [NYC DCWP: New laws and rules](https://www.nyc.gov/site/dca/about/new-laws-rules.page), Local Laws 107, 108, 123 and 124 of 2025, Local Law 110 of 2021, Local Laws 34 and 52 of 2026 with effective dates
- [NYC Council: Int 1332-2025 (Local Law 34 of 2026)](https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=7480055&GUID=265D0ED3-FB2F-48B9-AF70-79973B11E094), delivery worker deactivation, enacted January 17, 2026, effective a year later
- [Seattle OLS: App-Based Worker Minimum Payment Ordinance](https://www.seattle.gov/laborstandards/ordinances/app-based-worker-ordinances/app-based-worker-minimum-payment-ordinance), effective January 13, 2024, 2026 rates, upfront disclosure and the right to refuse offers
- [Seattle OLS: App-Based Worker Deactivation Rights Ordinance](https://www.seattle.gov/laborstandards/ordinances/app-based-worker-ordinances/app-based-worker-deactivation-rights-ordinance), effective January 1, 2025, reasonable policies, records, enforcement phases
- [Seattle: Ordinance 126878 (PDF)](https://seattle.gov/documents/departments/laborstandards/signed%20ordinance%20126878.pdf), the required measures before deactivation and the 14-day investigation and response deadlines
- [Minnesota Statutes 181C.03](https://www.revisor.mn.gov/statutes/cite/181C.03), per-mile, per-minute and per-ride minimums
- [Minnesota Statutes 181C.04](https://www.revisor.mn.gov/statutes/cite/181C.04), deactivation policy, notice, appeal and prohibited grounds
- [Minnesota DLI: Transportation network company drivers](http://dli.mn.gov/tnc), the December 1, 2024 start, 2027 rates and passenger service scope
- [Massachusetts: 2024 ballot question results](https://electionstats.state.ma.us/ballot_questions/search/year_from:2024/year_to:2024), Question 3 on rideshare driver unions
- [Colorado General Assembly: SB24-075](https://leg.colorado.gov/bills/sb24-075), payment disclosures to drivers and the deactivation policy deadline
- [DC Attorney General: DoorDash settlement](https://oag.dc.gov/release/ag-racine-reaches-25-million-agreement-doordash), November 24, 2020, tips used to subsidize pay
- [DC Attorney General: Instacart settlement](https://oag.dc.gov/release/ag-racine-announces-instacart-must-pay-254-million), August 19, 2022, a service fee presented as a tip
- [California PUC: TNC insurance requirements](https://www.cpuc.ca.gov/regulatory-services/licensing/transportation-licensing-and-analysis-branch/transportation-network-companies/tnc-insurance-requirements), Periods 1, 2 and 3 and their minimums
- [UK Supreme Court: Uber BV v Aslam [2021] UKSC 5 (PDF)](https://supremecourt.uk/uploads/uksc_2019_0029_judgment_19c9de2253.pdf), February 19, 2021, the five control factors and working time
- [EUR-Lex: Directive (EU) 2024/2831](https://eur-lex.europa.eu/eli/dir/2024/2831/oj/eng), the official text
- [LawPlayer: Directive (EU) 2024/2831 text](https://lawplayer.com/eu/act/32024L2831), a mirror of the official text used for Articles 4, 5, 7, 9, 10, 11, 12, 16 and 29 where EUR-Lex wouldn't load
- [EU Fundamental Rights Agency: Directive 2024/2831, Article 7](https://fra.europa.eu/en/law-reference/directive-eu-20242831-european-parliament-and-council-23-october-2024-improving), the limits on processing personal data
- [Ireland, Department of Enterprise: Public consultation on the Platform Work Directive](https://enterprise.gov.ie/en/consultations/consultations-files/public-consultation-on-platform-work-directive.docx), entry into force December 1, 2024 and the December 2, 2026 transposition deadline
- [BOE: Real Decreto-ley 9/2021](https://www.boe.es/buscar/act.php?id=BOE-A-2021-7840), Spain's presumption for platform delivery and works council information on algorithms

**Filings**

- [DoorDash: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1792789/000179278926000013/dash-20251231.htm), Dashers and their 2025 earnings, revenue net of Dasher payout
- [Uber: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), Drivers defined, agent conclusion, revenue net of Driver earnings
- [Lyft: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1759509/000162828026006960/lyft-20251231.htm), agent and principal, commissions from drivers, Attorneys General agreements, earnings standards by state
- [Maplebear (Instacart): Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000018/cart-20251231.htm), about 600,000 shoppers, revenue net of shopper payments

**Platform documentation**

- [DoorDash: Dasher pay](https://dasher.doordash.com/en-us/about/pay), guaranteed minimum shown before accepting, Earn per Offer and Earn by Time
- [DoorDash: Redesigned accept screen](https://help.doordash.com/en-us/dashers/article/redesigned-accept-modal), minimum guaranteed earnings including tips
- [DoorDash: Dasher ratings explained](https://help.doordash.com/en-us/dashers/article/dasher-ratings-explained), acceptance rate, no minimum, completion and customer rating thresholds
- [DoorDash: Earn by Time](https://help.doordash.com/dashers/s/article/Time-Earnings-Mode), one decline or unassign an hour, tips on top
- [DoorDash: Safeguards against account sharing](https://about.doordash.com/en-us/news/doordash-further-strengthens-safeguards-against-account-sharing), weekly selfie checks, triggers, mid-dash checks
- [DoorDash: Fast Pay](https://help.doordash.com/en-us/dashers/article/what-is-fastpay), $1.99 once a day
- [DoorDash: When do Dashers get paid](https://help.doordash.com/en-us/dashers/article/when-do-dashers-get-paid), the weekly cycle
- [DoorDash: Crimson](https://dasher.doordash.com/en-us/doordashcrimson), automatic payout after each dash, Starion Bank
- [Uber: Upfront fares for drivers](https://help.uber.com/en/driving-and-delivering/article/upfront-fares?nodeId=bc83ed7e-6725-41de-afcb-72d263e5589f), pay and destination before accepting, tips excluded
- [Uber: Courier identity verification](https://www.uber.com/us/en/newsroom/courier-identity-us/), account renting prohibited, selfie checks and blocks
- [Uber: Insurance for drivers](https://www.uber.com/us/en/drive/insurance/), coverage by period and contingent collision
- [Uber: Setting up Instant Pay](https://help.uber.com/en/driving-and-delivering/article/setting-up-instant-pay?nodeId=5bac3e84-baa4-424a-9780-14b279bcb2cc), fee, frequency, limits, NYC terms
- [Uber: Cashing out and weekly payouts](https://help.uber.com/en/driving-and-delivering/article/cashing-out-with-instant-pay?nodeId=1287939c-a6bb-448b-8d1a-20fa887aa7cb), weekly deposit timing
- [Lyft: Upfront pay](https://help.lyft.com/hc/en-us/driver/articles/8668928544-Upfront-pay), what a request shows
- [Lyft: Driver insurance](https://www.lyft.com/driver/insurance), coverage by period and state exceptions
- [Lyft: Express Pay](https://help.lyft.com/hc/en-us/all/articles/115012923167-Express-Pay), fee, minimum, frequency and weekly deposits
- [Instacart: Shopper earnings](https://company.instacart.com/shoppers/shopper-earnings), upfront details, 100% of tips, tip change windows, weekly pay and Instant Cashout
- [Instacart: Shopper Rewards Card](https://company.instacart.com/shopper-community/coming-soon-new-shopper-rewards-card-will-offer-fast-free-payouts-amp-cashback-on-gas), free payout after every batch, Lead Bank
- [Shipt: How do shoppers get paid](https://help.shipt.com/how-do-shoppers-get-paid), contractor status, estimated pay, weekly and instant pay, tips
- [TaskRabbit: Tasker rates and minimum hours policy](https://support.taskrabbit.com/hc/en-gb/articles/46260502667035-Tasker-Rates-Minimum-Hours-Policy), Taskers as contractors who choose categories and set hourly rates
