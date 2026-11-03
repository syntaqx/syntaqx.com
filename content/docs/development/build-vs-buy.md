+++
title = "Build vs Buy & Vendors"
nav_title = "Build vs Buy"
description = "Buy what isn't your differentiator, total cost both ways, vendor evaluation and security review, exit plans, third-party risk, sprawl, open source and renewals."
category = "Development"
order = 1027
tags = ["build-vs-buy", "vendors", "procurement", "third-party-risk", "architecture", "cost"]
+++

Every team that can write software is tempted to write all of it. The build looks cheaper because its costs are hidden in salaries the company pays anyway, and the vendor looks expensive because its cost arrives as an invoice. Both impressions are wrong in predictable ways: the build costs a team forever, not a quarter, and the vendor costs integration, review, lock-in and a price increase at every renewal. This chapter is how I decide, how I choose a vendor once I've decided to buy, and how I keep the decision reversible.

## The Default

**Buy what isn't your differentiator; build what is.** Martin Fowler's version splits software by whether "the _underlying business function_ is a differentiator or not". For a utility function, "you buy the package and adjust your business process to match the software". For a strategic one, using what competitors use "would cripple your ability to differentiate".

Most of a product is utility: authentication, email delivery, payments processing, tax calculation, error tracking, search infrastructure, feature flags, support ticketing, billing. Customers don't choose you because your password reset is homegrown. A smaller part is the reason the product exists: a routing algorithm, a pricing engine, a domain workflow nobody sells, the data model that makes the product fit its industry. That's where engineering time compounds, and every engineer spent rebuilding a utility is one not spent there.

The default flips in a few cases:

- **No vendor fits** without bending the product around it, and the fit gap is in the part customers notice.
- **The vendor would hold your differentiator,** or the data it depends on, in a way a competitor could also buy.
- **Cost at your scale.** Per-unit pricing that's cheap at a thousand customers can exceed a team's cost at a million. That's a measured crossover, not a feeling, and it moves as prices and scale change ([Measure Cost per Unit](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total)).
- **Regulation or a customer contract** forbids the data leaving your systems, and no vendor offers a deployment that satisfies it.
- **It's small.** A dependency or service for something a few dozen lines would do costs more than those lines, the same rule as [Adding a Dependency](/docs/development/dependencies#adding-a-dependency).

## Total Cost of Ownership, Both Ways

The comparison that decides most build-vs-buy arguments is the one nobody writes down: what each path costs over three to five years, in people as well as money.

| Cost | Build | Buy |
| --- | --- | --- |
| **Up front** | Design, implementation, migration | Evaluation, security review, contract, integration |
| **Every year** | The team that maintains it: upgrades, on-call, bugs, security fixes, compliance evidence | License or usage fees, the integration's upkeep, vendor management |
| **Hidden** | Features the vendor would have shipped that you never build; the expert who leaves | Price increases at renewal; workarounds for missing features; outages you can't fix |
| **At the end** | Replacement, when it ages out | Exit: export, migration, parallel running |

The line that's always underestimated is the build's yearly cost. A homegrown system needs owners who keep it current, answer its pages, extend it when requirements change and produce its audit evidence, and the cost of that ownership doesn't fall when the build is "done". Count it as a share of named engineers' time, not as zero because they're already on payroll. The buy side's underestimated line is integration: connecting a vendor well (retries, webhooks, reconciliation, a boundary module) is real engineering ([Third-Party Integrations](/docs/building-blocks/integrations)), and so is leaving.

Write both columns into the [design doc](/docs/development/design-docs) for the decision, with the assumptions (volumes, growth, team size) that would change the answer if they turned out wrong.

## Evaluating a Vendor

Once buying is the answer, the shortlist is decided by five things, in roughly this order:

- **Fit.** Does it do the job without bending the product? Run a proof of concept against your hardest real case, not the vendor's demo. Two or three candidates, a written list of must-haves, and a deadline.
- **API quality.** Is everything in the UI available in the API? Are writes idempotent, are webhooks signed and retried, is there a sandbox that behaves like production, are changes versioned with notice? An API that only covers the happy path becomes your integration's backlog. [API Design Principles](/docs/api-design/principles) and [Webhooks](/docs/api-design/webhooks) are the bar to hold it to.
- **Data export.** Can you get all of your data out, including history, relationships and files, in a documented format, without a support ticket? This is the exit plan's foundation (below).
- **Reliability and SLAs.** Read the SLA for what it promises and what it pays. A typical SLA pays service credits, not damages: AWS's compute SLA credits 10%, 30% or 100% of the month's charges as uptime falls and states that the SLA "sets forth your sole and exclusive remedies". A credit doesn't cover your lost revenue, so the real question is your design: what your product does when the vendor is down ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)). Check the vendor's status history too, not just its promise.
- **Security and compliance.** The review below, proportionate to the data the vendor will hold.

Then the commercial terms: price at your expected volume in two years, not today; what's metered and how overages bill; contract length; and the renewal terms covered at the end of this chapter.

### The Security Review

For a vendor that will hold customer or sensitive data, the review asks for documents, not promises:

- **A SOC 2 Type 2 report** (or ISO/IEC 27001 certificate with its Statement of Applicability), read, not just received. Check the period, the scope (is the product you're buying in it?), the exceptions, the subservice organizations carved out, and the complementary user entity controls, which are your obligations ([What Auditors Test](/docs/compliance/soc-2#what-auditors-test)). A report older than a year needs a bridge letter, and a bridge letter is only the vendor's word.
- **A data processing agreement** if the vendor processes personal data on your behalf, with the terms GDPR Article 28 requires, and its **published subprocessor list** with a way to be notified of changes ([Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa)). The vendor's subprocessors become your subprocessors, and your customers will ask about them.
- **A security questionnaire** where the report doesn't answer a question. Standard ones save both sides time: the Cloud Security Alliance's CAIQ is "a set of Yes/No questions a cloud consumer and cloud auditor may wish to ask", mapped to its Cloud Controls Matrix.
- **The specifics that bite:** SSO and SCIM for your staff's access ([SSO & Federation](/docs/security/sso-and-federation)), data residency, encryption and key management, breach notification timelines, and how support staff access your data ([Support Access](/docs/security/support-access)).

A vendor that won't share a SOC 2 report under NDA, or can't name its subprocessors, has answered the question.

## Plan the Exit Before Signing

Every vendor is a future migration, and the time to make it cheap is before the contract, when you have leverage. [Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter) has the engineering side (your own primary keys, one boundary per vendor, a tested export, your own copy of the records the business depends on), and [Vendor Exports and Lock-In](/docs/architecture/replacing-systems#vendor-exports-and-lock-in) the credentials that don't export through ordinary APIs. Before signing, I want answers to:

- **What can we export, in what format, and how fast?** Every object, with history and files, through an API or bulk export, at no extra charge. Run the export during the proof of concept.
- **What doesn't export at all?** Card data, password hashes, signing keys, trained models, computed scores. Each needs a contractual path or a plan to regenerate it.
- **What happens at termination?** A period to retrieve data after the contract ends, deletion with a certificate after that, and help with migration at stated rates.
- **What's the switching cost besides data?** Retraining staff, rebuilding integrations, re-certifying compliance, notifying customers whose DPAs list the vendor as a subprocessor.

Regulation is starting to help for cloud services. The EU Data Act has applied since 12 September 2025, and the Commission says it will "entirely remove switching charges", including data egress charges, from 12 January 2027; until then providers may charge the costs of switching. It covers data processing services in the EU, so it's a floor for some contracts, not a reason to skip the questions.

## Abstract Only Where Switching Is Realistic

An exit plan doesn't mean wrapping every vendor in a generic interface. A homegrown abstraction over a vendor costs design, code and lowest-common-denominator features every day, to save effort on a switch that may never happen.

My default: **one boundary module per vendor, always; a vendor-neutral interface only where switching is realistic.**

- **The boundary** is a single package that talks to the vendor, maps its types and IDs to yours, and is the only code that imports its SDK. It's cheap and it's what makes any switch a project instead of a rewrite.
- **A neutral interface** earns its cost where you'd actually swap or run several vendors: payment processors (routing, failover, fees), email and SMS delivery, LLM providers, object storage behind an S3-compatible API. These are commodities with real alternatives and real reasons to move.
- **No neutral interface** for a vendor whose value is its distinctive features: a search engine's relevance tuning, a data warehouse's SQL dialect, an identity provider's policy model. Wrapping those means using none of what you bought.

Where a standard exists (OpenTelemetry for telemetry, SQL, S3's API, OIDC and SAML for identity, SCIM for provisioning), using the standard is the abstraction, and it's maintained by someone else.

## Third-Party Risk, Proportionate to Access

Not every vendor deserves the same review. A font service and a payroll processor are both vendors; one holds nothing, the other holds bank accounts. NIST's Cybersecurity Framework 2.0 states the principle: "Suppliers are known and prioritized by criticality" (GV.SC-04), requirements are "integrated into contracts" (GV.SC-05), and plans cover "activities that occur after the conclusion of a partnership or service agreement" (GV.SC-10).

I tier vendors by the data they touch and what breaks without them:

| Tier | Data access or dependency | Review before use | Ongoing |
| --- | --- | --- | --- |
| **Critical** | Customer data, credentials, payments, or the product is down without it | SOC 2 Type 2 or equivalent, DPA, questionnaire, exit plan, named owner | Annual report review, subprocessor changes, incident drills that include it |
| **Standard** | Internal or limited personal data, or a degraded product without it | SOC 2 or questionnaire, DPA if personal data | Annual check that the use hasn't grown |
| **Low** | No sensitive data, easy to replace | Owner and purpose recorded | Renewal check |

The tier follows the use, not the vendor: an analytics tool that starts receiving customer records has moved up a tier, and someone has to notice. That's why every vendor has a named owner, and why the inventory records what data each one receives. This inventory is also the vendor management evidence a SOC 2 auditor samples ([Engineering Is the Evidence](/docs/compliance/soc-2#engineering-is-the-evidence)).

## Vendor Sprawl

Buying by default has a failure mode: every team buys its own tools, and the company ends up with three error trackers, two feature flag services and a hundred SaaS subscriptions nobody owns. Zylo, which sells SaaS management, reports from its 2026 SaaS Management Index that the average organization holds 305 SaaS applications and "utilizes only 54% of their provisioned licenses". The cost isn't only the licenses: each tool is an integration, a security review, an offboarding step and a place customer data might leak.

The controls are boring and effective:

- **One inventory** of every vendor, with owner, tier, data received, cost, contract dates and the decision record that justified it.
- **Purchases go through a light gate** (an owner, a tier, a check for an existing tool that does the job) so the second error tracker is caught before it's bought, not at the audit.
- **SSO for every tool** that supports it, so access ends when people leave, and usage data shows which seats are idle.
- **Consolidate at renewal,** the one moment it's cheap. A tool that duplicates another, or whose seats sit unused, gets a renew, shrink or cancel decision from its owner a quarter before the date.

Consolidation is a tradeoff, not a goal. One platform that does everything adequately can be worse than two that each do their job well; the question is whether the second tool's advantage is worth its review, integration and bill.

## Open Source as a Third Option

Open source isn't "free build". Adopting an open-source system (a database, a queue, a search engine, a workflow engine) means owning its operation: deployment, upgrades, scaling, backups, security patches and on-call, done by your team instead of a vendor's. The license cost is zero; the ownership cost is a share of a team, the same line as a build's yearly cost.

It's the right choice when:

- **The open-source option is the standard** and the managed versions are thin wrappers on it, so self-hosting later stays possible (Postgres, Redis-compatible stores, OpenTelemetry collectors).
- **You need to change it** or run it somewhere vendors can't (on-premises, air-gapped, at the edge).
- **The managed price at your scale** exceeds the cost of the people to run it, measured, not assumed.

My default is the **managed service of an open-source standard**: the operations bought, the interface portable. That keeps the vendor replaceable by another host or by your own team. The license is part of the decision ([Open-Source Licenses](/docs/compliance/open-source-licenses)), including whether a single company controls the project and could relicense it, and so is its maintenance health ([Dependencies & Upgrades](/docs/development/dependencies)).

## Renewals and Price Increases

Vendors raise prices at renewal, and most contracts renew automatically. Vertice, which sells SaaS purchasing services and tracks prices across its customers' contracts, reported early data for September 2026 showing SaaS inflation "rising to 14.3%". Whatever the exact number, a multi-year cost model that assumes today's price is wrong.

What to negotiate before signing, when you have leverage:

- **A renewal price cap,** a maximum percentage increase per year, or a fixed price for a multi-year term.
- **Notice periods** for price and term changes long enough to run an alternative evaluation, and an auto-renewal notice window you track.
- **Volume flexibility:** the right to reduce seats or committed usage at renewal, not only to add.
- **Exit terms** from the section above, in the same contract.

And what to run after: a renewal calendar in the vendor inventory, with each owner reviewing usage, cost and alternatives a quarter before the date. A renewal reviewed in its last week is a renewal accepted at whatever price was quoted.

## Writing the Decision Down

A build-vs-buy decision is a one-way door often enough that it deserves a short [design doc](/docs/development/design-docs): the problem, the options including "build" and "do nothing", the cost table both ways, the shortlist evaluation, the security review's outcome, the exit plan and the conditions that would reopen the decision (a price, a volume, a missing feature). When the conditions arrive, the decision gets reopened on its own terms instead of relitigated from scratch. Replacing the vendor later follows [Replacing Systems](/docs/architecture/replacing-systems).

## Checklist

- **Buy utilities, build differentiators,** with the exceptions (fit, scale, regulation, size) stated when you take one.
- **Total cost of ownership both ways,** with the build's yearly people cost and the buy's integration and renewal costs.
- **Vendor evaluation on fit, API quality, export, SLAs and security,** with a proof of concept on your hardest case.
- **A security review proportionate to data:** SOC 2 report read, DPA and subprocessors for personal data, questionnaire for gaps.
- **Exit terms before signing:** export, termination, and what doesn't export.
- **One boundary module per vendor;** neutral interfaces only where switching is realistic.
- **A tiered vendor inventory** with owners, data received, costs and contract dates.
- **Managed open-source standards** as the default third option, with ownership costs counted.
- **Renewal caps, notice windows and a renewal calendar** reviewed a quarter ahead.

## References

**Reference**

- [Martin Fowler: Utility vs Strategic Dichotomy](https://martinfowler.com/bliki/UtilityVsStrategicDichotomy.html), buying utility software and building what differentiates
- [NIST: Cybersecurity Framework 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), supply chain risk management outcomes GV.SC-04, GV.SC-05 and GV.SC-10
- [Cloud Security Alliance: CAIQ](https://cloudsecurityalliance.org/artifacts/star-level-1-security-questionnaire-caiq-v4), the standard cloud security questionnaire mapped to the Cloud Controls Matrix
- [European Commission: Data Act explained](https://digital-strategy.ec.europa.eu/en/policies/data-act-explained), application from 12 September 2025 and the removal of switching charges from 12 January 2027
- [AWS: Amazon Compute Service Level Agreement](https://aws.amazon.com/compute/sla/), service credit tiers and credits as the sole remedy

**In practice**

- [Zylo: SaaS license management](https://zylo.com/blog/license-management), application counts and license utilization from its 2026 SaaS Management Index
- [Vertice: SaaS inflation rate](https://www.vertice.one/insights/saas-inflation-rate), SaaS price increases tracked across purchasing data
