+++
title = "Competition Cases"
description = "The UK CMA's cloud market investigation and Microsoft SMS case, the EU's DMA cloud investigations, and the FTC's inquiry: what each found, decided and when."
category = "Hosting & Cloud Industry"
order = 2204
part = "Market Rules and Compliance"
tags = ["competition", "antitrust", "cma", "dma", "ftc", "regulation"]
+++

Cloud infrastructure became a competition case in 2022, when the UK's communications regulator opened a market study and a group of European providers filed a complaint about Microsoft's licensing. Four years on, three regulators have each taken a different route. The UK's Competition and Markets Authority ran a full market investigation, found harm to competition, and then chose voluntary steps on egress and interoperability plus a strategic market status investigation into Microsoft. The European Commission opened Digital Markets Act investigations into whether AWS and Azure should be designated gatekeepers even though they don't meet the law's numeric thresholds, and reached a preliminary yes. The US Federal Trade Commission ran a public inquiry, then a non-public investigation of Microsoft that, as of October 2026, has produced no public action. The concerns are the same everywhere: egress fees, software licensing that favors the licensor's own cloud, committed-spend discounts that make multi-cloud uneconomic, and interoperability.

This chapter tells each case with dates and what was actually decided, as of October 2026. The pricing side is [Egress & Switching](/books/hosting-and-cloud/egress-and-switching); the licensing disputes are [Licensing Disputes](/books/hosting-and-cloud/licensing-disputes). It adds `regulatory_commitments` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model).

## How the Regulators Do It

| Regulator | Instrument | Status as of October 2026 |
| --- | --- | --- |
| **UK CMA** | Market investigation, then strategic market status (SMS) under the digital markets regime | Final decision July 31, 2025: adverse effect on competition; recommended SMS investigations into Microsoft and AWS. March 31, 2026: Microsoft and Amazon took "material steps" on egress and interoperability; an SMS investigation into Microsoft, not AWS. Microsoft SMS investigation launched May 14, 2026; proposed decision October 16, 2026 that Microsoft meets the conditions; consultation closes November 13, 2026; final decision due by February 13, 2027 |
| **European Commission** | Digital Markets Act market investigations | Opened November 18, 2025: two on designating AWS and Azure as gatekeepers below the thresholds, one on whether DMA obligations fit cloud; a 12-month target for the two designations and 18 months for the third's report. Preliminary view June 25, 2026 that both should be designated. No final decision as of October 27, 2026; press expects one in November 2026 |
| **US FTC** | Request for information (2023), then a non-public investigation | RFI summary November 16, 2023. Investigation of Microsoft reported in November 2024; press reported in February 2026 that the FTC was questioning Microsoft's competitors. No complaint or public action as of October 2026 |

The UK and EU tracks share a premise: a cloud market with two leaders and high switching costs won't correct itself. They differ in instrument. The CMA's market investigation could impose remedies directly, and instead it handed the case to a newer, conduct-based regime. The DMA's obligations are fixed in the regulation, so the fight is over designation; once designated, a gatekeeper has six months to comply, with fines of up to 10% of worldwide turnover.

## How It Got Here

- **October 6, 2022:** Ofcom opened its cloud market study; CISPE complained to the Commission about Microsoft's licensing in November.
- **2023:** the FTC asked for comment on cloud in March and summarized what it heard on November 16; Ofcom referred the market to the CMA on October 5.
- **July 11, 2024:** CISPE settled with Microsoft; Google's complaint became public in September.
- **July 31, 2025:** the CMA's final decision found an adverse effect on competition.
- **November 18, 2025:** the Commission opened DMA cloud investigations; Google withdrew its complaint ten days later.
- **2026:** the CMA's March 31 package, the Microsoft SMS investigation from May 14, the Commission's preliminary view on June 25, and the CMA's proposed SMS decision on October 16.

## The UK: Market Investigation to SMS

Ofcom opened its cloud services market study on October 6, 2022 and referred the market to the CMA on October 5, 2023. The CMA published its provisional decision on January 28, 2025 and its final decision on July 31, 2025. It found an adverse effect on competition, with appendices on egress fees, software licensing and committed spend agreements, and, rather than imposing market investigation remedies itself, recommended that the CMA prioritise SMS investigations under the digital markets regime into Microsoft and AWS.

On March 31, 2026 the CMA announced a package. Microsoft and Amazon had taken "material steps to address interoperability and cloud egress fees" for UK customers, "subject to ongoing review"; the steps were not binding, the CMA's board would review progress in six months, and further steps were needed on multi-homing and switching. The specifics reported in the press (direct interconnects starting with Google Cloud, an interoperability application process, extending EU switching standards to the UK) come from the firms and press coverage, not from the CMA's release. Microsoft's UK egress variant ([Exit Waivers, 2024](/books/hosting-and-cloud/egress-and-switching#exit-waivers-2024)), with 180 days and single-service coverage for UK billing addresses from May 1, 2026, is one visible UK-specific change from the same period. The CMA chose not to open an SMS investigation into AWS.

The SMS investigation into Microsoft's "business software ecosystem" (Windows, Word, Excel, Teams and Copilot, with cloud licensing within it) launched on May 14, 2026. On October 16, 2026 the CMA published a proposed decision provisionally finding that Microsoft meets the statutory conditions for SMS designation; consultation runs to November 13, 2026, and the final decision is due by February 13, 2027. Designation would let the CMA impose conduct requirements, which is where cloud licensing terms would be addressed.

## The EU: DMA Gatekeeper Designation

The DMA designates gatekeepers for core platform services, cloud computing among them, mainly by thresholds of turnover and users; it also allows designation after a market investigation where a provider is an important gateway despite not meeting them. On November 18, 2025 the Commission opened three market investigations: two to assess whether AWS and Azure should be designated, and a third on whether the DMA can tackle practices in cloud computing (interoperability, business users' access to data, tying and bundling, and contract terms). It aimed to conclude the two designation investigations "within 12 months," which puts the target at November 2026, and to publish the third investigation's final report "within 18 months," possibly proposing updated cloud obligations by delegated act. On June 25, 2026 it reached a preliminary position that Amazon and Microsoft "should be designated as gatekeepers" for AWS and Azure, as "an important gateway between businesses and their customers in the EU," citing lock-in and switching costs. As of October 27, 2026 no final designation had been adopted; press reports expect the decision in November 2026.

Two related threads ran alongside. Google filed an antitrust complaint with the Commission about Microsoft's cloud licensing, made public in September 2024, and withdrew it on November 28, 2025, after the DMA investigations opened. And CISPE's 2022 complaint about Microsoft's licensing had already been withdrawn under a July 2024 settlement ([Licensing Disputes](/books/hosting-and-cloud/licensing-disputes)). The DMA route replaces case-by-case antitrust with standing obligations, which is why complainants stepped back.

## The US: Inquiry Without Action

The FTC asked for public comment on cloud computing in March 2023 and summarized 102 comments on November 16, 2023. The themes: egress fees, software licensing, minimum spend commitments, cloud credits from investors tying AI startups to one provider, single points of failure, and unclear security responsibilities. An investigation of Microsoft was reported in November 2024, covering the use of Office 365 to favor Azure, exit fees and incompatibility with rival clouds, with a civil investigative demand to Microsoft reported in late 2024. In February 2026 Bloomberg reported that the FTC was issuing demands to Microsoft's competitors about cloud, licensing and AI. The investigation is non-public, and as of October 2026 there was no complaint or enforcement action.

## What Each Case Is About

| Concern | UK CMA | EU DMA | US FTC |
| --- | --- | --- | --- |
| **Egress fees** | Appendix in the final decision; voluntary steps March 2026 | Switching costs cited in the preliminary view; the Data Act already regulates them | RFI theme |
| **Software licensing** | Appendix; addressed through the Microsoft SMS investigation | Theme of the withdrawn Google and CISPE complaints | Reported focus of the Microsoft investigation |
| **Committed spend** | Appendix in the final decision | | RFI theme |
| **Interoperability** | Voluntary steps March 2026 | Third market investigation on DMA fit | |
| **AI** | Copilot within the Microsoft SMS scope | | Investor credits theme; reported AI questions in 2026 |

## The Alternatives

| Instrument | Strengths | Failure modes | Used by |
| --- | --- | --- | --- |
| **Market investigation with remedies** | Can impose structural or behavioral remedies market-wide | Slow (three years from study to decision); the CMA chose not to use it | UK CMA (2022 to 2025) |
| **Voluntary commitments** | Fast; firms design the fix | Not binding; depends on review | UK CMA (March 2026) |
| **Conduct regime designation** | Standing, tailored obligations; fines | Designation fights; remedies still to be written | UK SMS (Microsoft), EU DMA (AWS, Azure) |
| **Ex ante sector law** | Applies to everyone; clear deadlines | Fixed rules may not fit every service | EU Data Act on switching |
| **Antitrust investigation** | Can address specific conduct | Non-public, years long, uncertain outcome | US FTC, EC complaints before 2025 |

## My Default

For a provider, my reading of the cases is that the regulated behaviors (egress at exit and in parallel, licensing that penalizes running software on rival clouds, discounts that require exclusivity) are converging on the same answer in every jurisdiction, and the cheapest course is to adopt that answer globally before a designation forces it in one market: free switching egress, at-cost in-parallel transfer, licensing that doesn't depend on which cloud runs it, and commitments measured in spend rather than exclusivity. A provider below the hyperscalers' scale isn't a target of these cases, but its customers will read the outcomes as the standard of fair terms.

What would change this: a final DMA designation or SMS conduct requirements will set specific obligations, and a provider subject to them should implement exactly those, with dates, rather than a general policy.

## How to Build It

A provider under regulatory review has obligations with deadlines: commitments to a regulator, conduct requirements after designation, compliance reports. They are rules as data with an owner and a clock, and they link to the systems that implement them.

```sql
CREATE TABLE regulatory_commitments (    -- what the provider promised or was ordered to do
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  authority        TEXT NOT NULL,        -- 'uk_cma', 'eu_commission', 'us_ftc'
  instrument       TEXT NOT NULL CHECK (instrument IN ('voluntary_step', 'undertaking',
                     'conduct_requirement', 'dma_obligation', 'settlement', 'order')),
  case_ref         TEXT NOT NULL,        -- the authority's case name or number
  jurisdiction     TEXT NOT NULL,        -- ISO 3166-1 or 'EU'
  summary          TEXT NOT NULL,
  binding          BOOLEAN NOT NULL,
  effective_during TSTZRANGE NOT NULL,
  review_due_at    TIMESTAMPTZ,          -- e.g. the CMA board's six-month review
  owner            TEXT NOT NULL,        -- the accountable team
  implemented_by   TEXT[],               -- feature flags, price versions, policy rows
  status           TEXT NOT NULL CHECK (status IN ('planned', 'implemented', 'reported',
                     'superseded'))
);
```

Notes on the sketch:

- **Commitments point at implementations.** A UK egress commitment names the waiver policy and price versions that implement it, so a regulator's review question ("show the step") is a join.
- **Binding is a column.** Voluntary steps and orders differ in consequence, and both need a review date.
- **Events:** `regulatory_commitment.review_due` and `regulatory_commitment.status_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to legal and the owning team.

## Auditing

- **Every commitment with its implementation and dates,** for the regulator's review.
- **Price and term changes made under a commitment,** linked to it, so their origin is clear in later disputes.

## What This Means for the System You Build

- **Track egress, licensing, committed spend and interoperability** as the four recurring concerns.
- **Expect the UK and EU outcomes to set customer expectations everywhere,** whatever the provider's size.
- **Record regulatory commitments as data** with owners, implementations and review dates.
- **Treat a designation as a dated project:** six months to comply under the DMA.

## References

**United Kingdom**

- [CMA: Cloud services market investigation](https://www.gov.uk/cma-cases/cloud-services-market-investigation), the Ofcom reference, provisional and final decisions and the SMS recommendation
- [CMA: Package of actions on business software and cloud services](https://www.gov.uk/government/news/cma-announces-package-of-actions-on-business-software-and-cloud-services), March 31, 2026, the voluntary steps, review and the Microsoft SMS plan
- [CMA: Proposed decision, SMS investigation into Microsoft's business software ecosystem](https://www.gov.uk/government/consultations/proposed-decision-sms-investigation-into-microsofts-business-software-ecosystem), October 16, 2026, launch date, consultation and final decision deadline
- [Tech Policy Press: UK cloud regulator opts for voluntary commitments](https://www.techpolicy.press/uk-cloud-regulator-opts-for-voluntary-commitments-launches-microsoft-investigation/), the commitment specifics as reported

**European Union**

- [European Commission: Market investigations on cloud computing under the DMA](https://digital-markets-act.ec.europa.eu/commission-launches-market-investigations-cloud-computing-services-under-digital-markets-act-2025-11-18_en), November 18, 2025
- [European Commission: Preliminary position on Amazon's and Microsoft's cloud services](https://digital-markets-act.ec.europa.eu/commission-reaches-preliminary-position-amazons-and-microsofts-market-leading-cloud-services-should-2026-06-25_en), June 25, 2026
- [European Commission press release IP/25/2717](https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_25_2717/IP_25_2717_EN.pdf), Brussels, November 18, 2025: the three investigations, the 12-month and 18-month targets and the six-month compliance period
- [European Commission press release IP/26/1444](https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_26_1444/IP_26_1444_EN.pdf), Brussels, June 25, 2026: the preliminary findings, rights of defence and the next steps
- [The Register: Commission lines up Amazon and Microsoft for cloud gatekeeper status](https://www.theregister.com/legal/2026/06/25/european-commission-lines-up-amazon-and-microsoft-for-cloud-gatekeeper-status/5262127), lock-in, the six-month compliance period and fines
- [PYMNTS: Google withdraws EU antitrust complaint targeting Microsoft's cloud business](https://www.pymnts.com/antitrust/2025/google-withdraws-european-union-antitrust-complaint-targeting-microsoft-cloud-business/), November 28, 2025

**United States**

- [FTC: Cloud computing RFI, what we heard and learned](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2023/11/cloud-computing-rfi-what-we-heard-learned), November 16, 2023, 102 comments and the themes
- [PYMNTS: FTC grills Microsoft rivals](https://www.pymnts.com/antitrust/2026/ftc-grills-microsoft-rivals-to-bolster-antitrust-probe/), February 13, 2026, the reported demands to competitors and the 2024 investigation
- [Bloomberg: FTC ratchets up Microsoft probe](https://www.bloomberg.com/news/articles/2026-02-13/ftc-ratchets-up-microsoft-probe-queries-rivals-on-cloud-ai), February 13, 2026
