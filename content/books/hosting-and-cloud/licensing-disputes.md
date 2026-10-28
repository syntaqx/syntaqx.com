+++
title = "Licensing Disputes"
description = "Microsoft's Listed Providers rule and the CISPE settlement, Broadcom's VMware licensing changes and the lawsuits and complaints they drew, as of October 2026."
category = "Hosting & Cloud Industry"
order = 2205
part = "Market Rules and Compliance"
tags = ["licensing", "microsoft", "vmware", "broadcom", "cispe", "competition"]
+++

A cloud's price is partly someone else's software. Windows Server, SQL Server and Office run on most clouds under Microsoft's licensing terms, and a hosting provider's virtualization layer has very often been VMware, under VMware's. When a licensor that also sells a cloud changes the terms for running its software on rival clouds, or a new owner changes the terms for running a hypervisor at all, the providers' costs move overnight and they can't switch quickly. Those are the two great licensing disputes of the 2020s: Microsoft's 2019 restriction on bringing licenses to the largest rival clouds, which European providers took to the European Commission and settled in 2024, and Broadcom's 2023 to 2026 rebuild of VMware's licensing and partner program after its acquisition, which drew lawsuits from customers and a court challenge to the merger's clearance.

This chapter tells both with dates and current status, as of October 2026. Open source license changes (MongoDB, Elastic, Redis, HashiCorp) are [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds); control panel licensing is [Control Panel Licensing & the Alternatives](/books/hosting-and-cloud/control-panel-licensing); the regulators' wider cases are [Competition Cases](/books/hosting-and-cloud/competition-cases). It adds `byol_declarations` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model).

## How the Providers Do It

| Licensor | What changed | Who it hit | Status, October 2026 |
| --- | --- | --- | --- |
| **Microsoft** | From October 1, 2019, licenses without License Mobility rights can't be redeployed on "Listed Providers'" dedicated servers: Microsoft, Alibaba, Amazon (including VMware Cloud on AWS) and Google. October 2022 terms added the Flexible Virtualization Benefit for other outsourcers | Customers bringing their own licenses to AWS and Google Cloud; European providers on the other side of the line | CISPE's complaint withdrawn under a July 11, 2024 settlement; its monitor rates Microsoft "Green" (September 2026). Google's complaint withdrawn November 28, 2025 |
| **Broadcom (VMware)** | After closing the acquisition on November 22, 2023: end of perpetual licenses and support renewals announced December 11, 2023; the cloud service provider program and white-label model phased out in the EEA from October 31, 2025 | Enterprises on perpetual licenses; hosting providers reselling VMware | AT&T suit settled November 2024; Tesco suit pending with trial listed for late 2027; CISPE's challenge to the merger clearance (T-503/25) pending; CISPE complaint to the Commission filed March 19, 2026; Japan's competition authority closed its probe with no action on July 3, 2026 |

Both cases turn on the same asymmetry: the software is a small share of what the provider sells but can't be swapped out in a contract cycle. Windows workloads need Windows licenses, and a VMware estate needs a migration project to leave.

## How It Got Here

- **August 1, 2019:** Microsoft announced updated licensing rights for dedicated hosted cloud services, effective October 1, 2019, creating the Listed Providers category.
- **May 26, 2022:** Broadcom announced the VMware acquisition, about $61 billion in cash and stock plus $8 billion of VMware net debt; it closed November 22, 2023.
- **October 2022:** Microsoft's Product Terms update extended rights for Software Assurance and subscription customers to run on "Authorized Outsourcers'" shared servers (the Flexible Virtualization Benefit), while keeping Listed Providers excluded.
- **November 2022:** CISPE filed a complaint with the European Commission about Microsoft's licensing.
- **December 11, 2023:** Broadcom announced the end of sale of perpetual licenses and of support renewals for perpetual offerings, "beginning today (effective dates will vary)."
- **July 11, 2024:** CISPE and Microsoft settled.
- **August 29, 2024:** AT&T sued Broadcom in New York over support for its perpetual licenses.
- **September 2024:** Google's complaint to the Commission about Microsoft's cloud licensing became public.
- **July 24, 2025:** CISPE filed an action at the EU General Court to annul the Commission's 2023 clearance of Broadcom's acquisition of VMware (T-503/25).
- **October 31, 2025:** Broadcom began phasing out the VMware cloud service provider program and white-label model in the EEA.
- **November 2025:** the Commission opened its DMA cloud investigations, and Google withdrew its complaint on November 28.
- **2026:** VCSP contracts not renewed after January 26; CISPE's complaint to DG COMP on March 19; JFTC closure on July 3; ECCO's fourth report in September.

## Microsoft and the Listed Providers

Microsoft's outsourcing guidance draws the line: "An Authorized Outsourcer is any entity that is not a Listed Provider nor using a Listed Provider for data center resources." The Listed Providers are Microsoft, Alibaba, Amazon (including VMware Cloud on AWS) and Google. Customers can bring licenses with License Mobility through Software Assurance to any provider, but licenses without mobility rights, which before October 2019 could be deployed on dedicated hosts at any provider, can't be redeployed on Listed Providers' servers. The concern regulators heard is that a customer who already owns the licenses pays more to run them on AWS or Google Cloud than on Azure.

European providers' complaint ran the other way: they weren't Listed Providers, but they wanted the terms Azure customers got. The CISPE settlement of July 11, 2024 had CISPE withdraw its November 2022 complaint in exchange for Microsoft building a product for European hosters (described as "Azure Stack HCI for Hosters," with Windows 11 multi-session virtual desktops, free Extended Security Updates and pay-as-you-go SQL Server) within nine months or CISPE could refile, a lump sum for CISPE's costs (reported in the press at about €20 million), and an independent monitor. AWS, Google and Alibaba were excluded from the settlement's benefits.

The monitor, the European Cloud Competition Observatory (ECCO), tracked delivery. Its first report (February 2025) rated Microsoft "Amber/Offtrack" over slow progress; its second (May 16, 2025) kept Amber, with both sides agreeing the product phase had ended because "the proposed product did not deliver," and gave Microsoft until July 10 to propose a commercially equivalent offer. Microsoft moved to Green in the third report (October 2025), and the fourth (September 2026) "maintains Microsoft's Green status," noting implementation of the July 2025 commitments and harmonized Extended Security Updates pricing. The same report rated Broadcom "Red – Critical."

Google pursued its own complaint, made public in September 2024, and withdrew it on November 28, 2025, after the Commission opened DMA investigations into AWS and Azure ([The EU: DMA Gatekeeper Designation](/books/hosting-and-cloud/competition-cases#the-eu-dma-gatekeeper-designation)). The UK CMA's cloud decision treated licensing in an appendix and folded it into its SMS investigation of Microsoft's business software ecosystem.

## Broadcom and VMware

Broadcom's changes after closing the VMware deal reached customers and providers in two waves.

**Customers.** On December 11, 2023 Broadcom announced the end of perpetual licenses and of support renewals for perpetual offerings, moving customers to subscriptions; it described the change as "beginning today (effective dates will vary)." AT&T sued Broadcom in New York state court on August 29, 2024, arguing that its contract entitled it to renew support for its perpetual licenses; the parties told the court on November 21, 2024 that they had a settlement in principle, with terms not disclosed. Tesco sued Broadcom, VMware and its reseller Computacenter in the UK High Court in 2025; as of June 2026 the trial was listed for a window from November 1, 2027 to February 25, 2028.

**Providers.** Broadcom phased out the VMware Cloud Service Provider program and its white-label model in the EEA from October 31, 2025: no VCSP contract renewals after January 26, 2026, open opportunities to close by March 31, 2026, and a new program by invitation only. For a hosting provider reselling VMware-based private cloud, that meant either qualifying for the new program, buying licenses directly at enterprise terms, or migrating to another hypervisor. [Epilogue: Broadcom and VMware](/books/hosting-and-cloud/virtualization-and-vps#epilogue-broadcom-and-vmware) covers where the hosts went.

**The challenge.** CISPE filed an action at the EU General Court on July 24, 2025 to annul the Commission's 2023 clearance of the merger (Case T-503/25); the Commission's decision summary had been published on May 13, 2025, which is the date sometimes mistaken for the decision. CISPE lodged its reply to the Commission's defence on December 3, 2025. On March 19, 2026 CISPE filed a complaint with the Commission's competition directorate asking for interim measures against Broadcom's licensing practices. ECCO's September 2026 report said no formal investigation had been announced, while describing a Commission request for information that Broadcom sought to suspend. In Japan, the Fair Trade Commission closed its VMware probe on July 3, 2026 without action, according to press reports.

## The Alternatives

For a provider whose costs depend on a licensor's terms:

| Approach | Model | Strengths | Failure modes | Who does it |
| --- | --- | --- | --- | --- |
| **Resell the licensor's subscription** | License-included instances, provider's agreement with the licensor | Simple for customers | Prices follow the licensor; margin squeezed | Every cloud for Windows Server |
| **Bring your own license** | Customer supplies licenses with mobility rights | Customer's existing investment | Listed Provider restrictions; audit exposure for the customer | AWS, Google Cloud, Azure, hosters |
| **Litigate or complain** | Courts and competition authorities | Can change terms for everyone | Years; settlements may exclude others | CISPE, AT&T, Tesco, Google |
| **Migrate off** | Replace the licensed layer with open source or another vendor | Removes the dependency | Migration cost; feature gaps | Hosts moving from VMware to KVM-based stacks |
| **Build your own** | Own hypervisor or OS stack | No licensor | Large engineering investment | Hyperscalers' own hypervisors |

## My Default

My default for a provider is to keep any licensed layer it can't replace in a year out of the core of its platform: run an open-source hypervisor (KVM) and sell licensed software as license-included SKUs with the license fee as a pass-through, so a licensor's price change is a price change on that SKU and not a crisis. Where customers bring licenses, record what they declared and on what basis, because the licensor's audit goes to the customer and the customer comes to the provider. And treat a licensor's partner program as a contract that can end, with a migration plan priced before it does.

What would change this: a provider whose customers specifically buy VMware-compatible or Windows-heavy environments has to carry the license, and should then negotiate term length and price protection as hard as it negotiates power.

## How to Build It

License fees already have a home: a SKU with `pass_through = 'license'`, and for panels, `license_seats` in [Control Panel Licensing & the Alternatives](/books/hosting-and-cloud/control-panel-licensing#how-to-build-it); upstream open source licenses are `product_licenses` from [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds#how-to-build-it). This chapter adds the customer's declaration when it brings its own license, so the provider can show what the customer claimed and what placement it got.

```sql
CREATE TABLE byol_declarations (         -- a license the customer says it brings
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  resource_id       UUID NOT NULL REFERENCES resources (id),   -- the VM or host it runs on
  licensor          TEXT NOT NULL,       -- 'microsoft', 'oracle', 'broadcom', ...
  product           TEXT NOT NULL,       -- 'windows_server', 'sql_server_enterprise'
  basis             TEXT NOT NULL CHECK (basis IN ('license_mobility_sa',
                      'flexible_virtualization', 'dedicated_host_pre_2019', 'other')),
  quantity          NUMERIC NOT NULL,    -- cores, processors, users, as the licensor counts
  tenancy           TEXT NOT NULL CHECK (tenancy IN ('shared', 'dedicated_host', 'bare_metal')),
  declared_at       TIMESTAMPTZ NOT NULL,
  declared_by       TEXT NOT NULL,       -- typed actor
  valid_during      TSTZRANGE NOT NULL,  -- while the resource runs under it
  terms_version     TEXT NOT NULL        -- the licensor terms version the declaration cites
);
```

Notes on the sketch:

- **The declaration is the customer's.** The provider records it and its basis; it doesn't certify compliance, which is between customer and licensor.
- **Tenancy matters to the terms.** Several bases depend on dedicated hardware, so the declaration records the tenancy of the resource at the time, from [`virtual_machines.tenancy`](/books/hosting-and-cloud/hosting-and-cloud-business#one-resource-table).
- **Terms are versioned.** A declaration cites the licensor terms version in force, because the 2019 and 2022 changes made the same deployment compliant or not depending on its date.
- **License-included is a SKU.** When the provider supplies the license, it is a `pass_through = 'license'` SKU with its own price versions, so a licensor's price change is a new version with notice.
- **Events:** `byol_declaration.created` and `byol_declaration.ended` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing (license-included SKUs stop rating) and to the customer's license reports.

## Auditing

- **Every BYOL declaration with its basis, quantity, tenancy and terms version,** so a customer facing a licensor audit can show what ran where and when.
- **License pass-through billed against what the provider paid the licensor,** per SKU and period.
- **Partner program terms and their end dates,** with the migration plan's status.

## What This Means for the System You Build

- **Know which licensed layers you can't replace quickly,** and price the migration before a licensor changes terms.
- **Sell licensed software as pass-through SKUs** so a licensor's change is a price version, not a margin crisis.
- **Record BYOL declarations** with basis, tenancy and the terms version.
- **Expect Listed Provider-style restrictions** to follow the licensor's competitive position, and the settlement terms to exclude the largest rivals.
- **Track the open cases** (T-503/25, Tesco, the Commission complaint) as dated risks to VMware-based products.

## References

**Microsoft**

- [Microsoft: Updated licensing rights for dedicated cloud](https://www.microsoft.com/en-us/licensing/news/updated-licensing-rights-for-dedicated-cloud), August 1, 2019, the Listed Providers and the October 1, 2019 effective date
- [Microsoft: Listed Providers](https://www.microsoft.com/licensing/docs/view/Listed-Providers), effective October 1, 2019
- [Microsoft: Outsourcing software management guidance](https://www.microsoft.com/licensing/guidance/Outsourcing), the Authorized Outsourcer definition, the 2019 and 2022 Product Terms changes and the Flexible Virtualization Benefit
- [CISPE: Settlement with Microsoft in the fair software licensing case](https://cispe.cloud/cispe-and-microsoft-agree-settlement-in-fair-software-licensing-case/), July 11, 2024, terms and exclusions
- [Tech Monitor: CISPE and Microsoft settle](https://www.techmonitor.ai/?p=407550), July 11, 2024, the reported amount
- [CISPE: ECCO first report on Microsoft](https://cispe.cloud/website_cispe/wp-content/uploads/2025/02/ECCO-first-report-Microsoft-FINAL.pdf), February 2025, Amber/Offtrack
- [CISPE: ECCO highlights new phase in agreement with Microsoft](https://cispe.cloud/ecco-highlights-new-phase-in-agreement-with-microsoft/), May 16, 2025, the product phase ending and the July 10 deadline
- [CISPE: Fourth ECCO report](https://www.cispe.cloud/website_cispe/wp-content/uploads/2026/09/2026_09-Fourth-ECCO-Report-FINAL.pdf), September 2026, Microsoft Green, Broadcom Red, the Commission request for information
- [PYMNTS: Google withdraws EU antitrust complaint](https://www.pymnts.com/antitrust/2025/google-withdraws-european-union-antitrust-complaint-targeting-microsoft-cloud-business/), November 28, 2025

**Broadcom and VMware**

- [Broadcom: Acquisition announcement (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1730168/000119312522160371/d323890dex991.htm), May 26, 2022, consideration and assumed debt
- [Broadcom: Completion of the VMware acquisition (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1730168/000114036123054354/ef20015100_ex99-1.htm), November 22, 2023
- [VMware: VMware by Broadcom business transformation](https://news.vmware.com/company/vmware-by-broadcom-business-transformation), December 11, 2023, end of perpetual licenses and support renewals
- [The Register: Broadcom and VMware cloud partners](https://www.theregister.com/2026/01/31/broadcom_vmware_cloud_partners/), the EEA VCSP phase-out dates
- [Legal Dive: Broadcom and AT&T settle](https://www.legaldive.com/news/broadcom-att-vmware-settlement-licensing-support-lawsuit/733955/), November 22, 2024, the filing and the settlement in principle
- [The Register: Tesco v. Broadcom trial window](https://www.theregister.com/a/5256133), June 17, 2026
- [CISPE: Action to annul the Broadcom and VMware clearance](https://www.cispe.cloud/?p=24784), July 24, 2025, Case T-503/25
- [CISPE: Reply to the Commission's defence](https://www.cispe.cloud/?p=25170), December 3, 2025, and the summary publication date
- [CISPE: Complaint to DG COMP](https://www.cispe.cloud/?p=25724), March 19, 2026, interim measures
- [PYMNTS: Japan closes Broadcom VMware antitrust probe](https://www.pymnts.com/cpi-posts/japan-closes-broadcom-vmware-antitrust-probe/), July 4, 2026, the July 3 closure
