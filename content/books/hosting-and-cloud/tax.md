+++
title = "Tax on Hosting & Cloud"
description = "Seller entities by region, VAT and GST on electronic services, US sales tax on hosting, IaaS and SaaS, Chicago's cloud tax, telecom taxes and USF on CPaaS."
category = "Hosting & Cloud Industry"
order = 2194
part = "Metering and Billing"
tags = ["tax", "vat", "sales-tax", "telecom-tax", "billing"]
+++

Indirect tax on infrastructure is hard for a reason that has nothing to do with rates: nobody agrees on what the product is. The European Union lists website hosting, remote systems administration and on-demand disk space as electronically supplied services by name. New York says a cloud instance is a non-taxable service. Texas says the same instance is taxable data processing, but only on 80% of the charge. Pennsylvania taxes remotely accessed software by where its users sit; Ohio taxes data processing only when the buyer uses it in business; Washington taxed data processing as a retail sale from October 2025 and has a contingent law taking it back out in 2029; Chicago taxes the "non-possessory lease" of a computer at 15%. Then a CPaaS adds telecom: federal universal service contributions recalculated every quarter, state 911 surcharges per line, and local utility users' taxes, each sourced to a service address rather than a billing address.

Every customer of a cloud is remote, so nexus is reached almost everywhere at once; the hard question is taxability, line by line, and which of the provider's own legal entities is selling. The engineering of indirect tax (a code per item, tax as a quote until finalization, engines, sourcing as data, US economic nexus, exemptions as documents, VAT on digital goods) is the playbook's [Sales Tax & VAT](/docs/payments/sales-tax). This chapter covers what infrastructure adds: seller entities by region, how providers decide where a customer is, VAT and GST on electronic services, the US state split for hosting, IaaS and SaaS, Chicago, marketplaces, withholding, telecom taxes and regulatory fees, and the tables that hold them. It isn't tax advice; positions change quarterly, and every figure here is dated.

## How the Providers Do It

Published tax mechanics, as of October 2026:

| Provider | Selling entities | How the customer's location is set | Business customers abroad | United States |
| --- | --- | --- | --- | --- |
| **AWS** | A seller of record per country: 14 local entities (Australia, Brazil, Canada, India, Indonesia, Japan, Malaysia, Mexico, New Zealand, Singapore, South Africa, South Korea, Taiwan, Turkey), Amazon Web Services EMEA SARL for the rest of Europe, the Middle East and Africa, and Amazon Web Services, Inc. for all other countries; EU telecom services sold by AMCS LLC | Computed at invoicing: a valid tax registration number's country wins; otherwise the billing or contact address that matches a card's country, then billing, then contact address; invoice payers' cards ignored; each linked account assessed separately | In the 17 EU states where AWS EMEA SARL has branches, VAT is charged even with a valid number unless a special status applies; elsewhere in the EU, no VAT with a valid number | Registered in 53 US jurisdictions, Chicago listed separately; the payment method's address sets location; Alabama's flat 8% simplified sellers use tax |
| **Google Cloud** | Google Payment Corp bills US customers since September 1, 2023; Google Cloud EMEA Limited contracts in the UK and Germany, Google Cloud France SARL in France; Google Cloud Italy S.r.l. since 2022; for Marketplace purchases the settlement billing entity is Google Payments Limited (UK) or Google Payments Ireland Limited (France, Germany) | Billing address; the account type (Business or Individual) is chosen when the billing account is created "and cannot be edited" | EU Business accounts get no VAT and self-assess; Individual accounts pay local VAT; India: 0% with a valid GSTIN from Google Asia Pacific, 18% without, 18% always from Google Cloud India | State and local sales tax by billing address |
| **Azure** | Not published by country on the pages opened | Sold-to address, or a ship-to/service usage address where different; ship-to only for Canada, Puerto Rico and the US, one per billing profile (MCA) or per subscription (pay-as-you-go) | Tax IDs collected for the listed countries; India's GSTIN through the subscription address | Ship-to sets state tax; changes apply only to future invoices, and past invoices are never regenerated "due to tax implications" |
| **DigitalOcean** | Not stated on the tax pages | The account's tax location, initially the primary payment method's address | EU VAT only for non-business customers; a valid VAT ID removes it; UK VAT with reverse charge for valid UK VAT IDs; Canada GST/HST, QST, BC and Saskatchewan PST, Manitoba RST | Collects in a published list of states and cities, several on SaaS products only, with exemption certificates through Ryan ControlPoint |
| **Vercel** | A US entity with no VAT ID | Billing details; changes apply to future invoices only | Customers add their own VAT ID "for self-reporting" | Not detailed on the pages opened |
| **GoDaddy** | Not named on the help page | "Based on the tax laws of your billing address" | Not detailed | Domain registrations, hosting plans and SaaS "may be subject to sales tax" |

Three patterns:

- **The seller is a routing decision.** AWS assigns a seller of record from address data and uses it for the invoice header, currency and tax rules; Google separates the entity that contracts from the one that bills. Which legal entity sells decides which registrations apply, which invoice series numbers the document and whose VAT number appears on it.
- **Location is computed, with evidence.** AWS publishes its precedence; Azure lets one account hold several service addresses through billing profiles or subscriptions; DigitalOcean starts from the payment address. All three keep the customer's typed address as one input, not the answer.
- **Business status flips the treatment, and providers decide it differently.** A VAT number removes VAT at DigitalOcean, doesn't in AWS's branch countries, and Google decides it once, at account creation, by type.

## How We Got Here

- **1998 to 2020: the Internet Tax Freedom Act.** ITFA, enacted in 1998, barred state and local taxes on Internet access and multiple or discriminatory taxes on electronic commerce; P.L. 114-125 made the moratorium permanent and kept a grandfather clause for states already taxing access until June 30, 2020. From July 1, 2020, the six states still taxing access (Hawaii, New Mexico, Ohio, South Dakota, Texas, Wisconsin) had to stop. ITFA protects the pipe; hosting, cloud and SaaS aren't Internet access, and VoIP was excluded.
- **January 1, 2015: EU place of supply moves to the consumer.** The Mini One Stop Shop started on that date for telecommunications, broadcasting and electronic services sold to consumers, taxed where the consumer is.
- **April 14, 2015: New York on cloud computing.** Advisory opinion TSB-A-15(2)S concluded that a provider's "Cloud Computing product" (instances of processor, memory and storage) is "a non-taxable service."
- **June 9, 2015: Chicago's cloud tax.** The City's Lease Transaction Tax Ruling #12, issued with Amusement Tax Ruling #5, treated charges under a "non-possessory computer lease" as taxable leases, effective September 1, 2015; after objections the City delayed the ruling to January 1, 2016.
- **July 1, 2018: AWS EMEA SARL.** AWS's Luxembourg entity began selling, with branches in twelve EU states treated as local VAT vendors from that day, and more added through April 1, 2023.
- **September 30, 2019: *Labell v. City of Chicago*.** The Illinois Appellate Court affirmed the amusement tax on streaming against challenges that included an ITFA discrimination claim.
- **July 1, 2021: OSS and Canada.** The One Stop Shop replaced MOSS and extended it; Canada's simplified GST/HST registration for non-resident digital vendors began, at C$30,000 of consumer sales in 12 months.
- **September 1, 2023: Google Payment Corp.** Google Cloud's US billing entity changed from Google LLC.
- **April 2, 2025: Texas.** The amended data processing rule, 34 TAC 3.330, took effect.
- **June 27, 2025: *FCC v. Consumers' Research*.** The Supreme Court, 6-3 in an opinion by Justice Kagan, upheld the universal service contribution scheme against the nondelegation challenge.
- **October 1, 2025: Washington ESSB 5814.** Information technology services, data processing among them, became retail sales; web hosting and domain registration were excluded.
- **January 1, 2026: Chicago at 15% and Manitoba's cloud tax.** Chicago's lease tax rose to 15% from 11%; Manitoba's retail sales tax began to apply to cloud computing (SaaS, PaaS and IaaS), collected by resident and non-resident providers.
- **March 26, 2026: Canada's digital services tax repealed.** The repeal received Royal Assent and the CRA refunds all DST payments, with interest.
- **March 30, 2026: Washington ESSB 6346.** Signed as chapter 238, Laws of 2026, it amends RCW 82.04.050 and 82.04.192 from January 1, 2029, taking ESSB 5814's information technology and data processing services back out of retail sales, but those sections are null and void if a court of final jurisdiction invalidates the act's new income tax (section 201): a contingent repeal.
- **September 14, 2026: a 42.0% contribution factor.** The FCC's proposed universal service contribution factor for the fourth quarter of 2026 (DA 26-946).

## Seller Entities

A provider at scale sells through several legal entities, and the core model already gives every account a `seller_merchant_id` ([the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)). What decides it:

- **Local entities for local rules.** AWS's table maps account country to a seller of record, assigned at sign-up "based on your billing and contact information," with a catch-all US entity. A local entity lets customers be billed in local currency by a local company, which some countries' invoicing and withholding rules effectively require.
- **Separate entities for separate products.** AWS sells EU telecommunications services through AMCS LLC, registered under MOSS, rather than through AWS EMEA SARL. A provider adding voice or messaging to a cloud usually needs a telecom entity with its own registrations, and the seller becomes a property of the line, not just the account.
- **Contracting and billing entities can differ.** Google Cloud EMEA Limited is the contracting entity for UK and German customers, while Marketplace invoices come from Google Payments Limited or Google Payments Ireland Limited, and paying the billing entity satisfies the obligation to the contracting one. The data model needs both: the contract party for terms and disputes, the billing party for invoice numbering and tax.
- **Branches as registrations, not entities.** AWS EMEA SARL is one entity with branches registered as local VAT vendors from dated starts (twelve on July 1, 2018; Austria on February 1, 2020; the Czech Republic August 1, 2020; Romania November 1, 2020; Greece January 1, 2021; Estonia April 1, 2023). Each branch is a `tax_registrations` row on one merchant, effective-dated.
- **The seller changes, the account doesn't.** Billing transfer at AWS moves seller of record information to the account that pays; Google's US billing entity changed on a stated date, September 1, 2023. A change of seller is a dated reassignment that applies to invoices issued after it, never a rewrite of old ones.

## Where Is the Customer

The playbook's [Sourcing Is Data](/docs/payments/sales-tax#sourcing-is-data) sets the rule: location is a determination with evidence. Infrastructure adds three wrinkles:

- **Precedence is a published algorithm.** AWS's order (valid tax number country; then billing or contact address matching a card's country; then billing; then contact), applied at invoicing and ignoring cards for invoice payers, is the kind of rule that belongs in data with its version, because a customer disputing a VAT charge will ask which input won.
- **One payer, many places of use.** Azure lets a US, Canadian or Puerto Rican customer hold one ship-to address per billing profile or per subscription, and says to create more billing profiles for more addresses. AWS assesses each linked account separately unless the organization turns on tax settings inheritance, which consolidates usage into one tax invoice. States reach the same problem from the other side: Texas lets a multistate purchaser allocate by "a reasonable and consistent method supported by its business records," Pennsylvania lets a purchaser allocate remote software users out of state on Form REV-1220 and presumes all users are in the state when the billing address is, Manitoba lets cloud charges be prorated by licences or users in the province.
- **Evidence beyond the address.** Canada treats a consumer as resident when two or more indicators (home or billing address, IP address, payment details, SIM) point to Canada; the UK requires two pieces of evidence for consumer digital sales. A cloud already records sign-up IP, card country and billing address; storing which ones were used, per invoice, is what makes the location defensible.

## VAT and GST on Electronic Services

**What is an electronic service.** The EU's Implementing Regulation 282/2011, Annex I, lists "Website hosting and webpage hosting," "automated, online and distance maintenance of programmes," "remote systems administration," "online data warehousing where specific data is stored and retrieved electronically," "online supply of on-demand disc space," and "Accessing or downloading software." Hosting, storage, managed services and SaaS are electronically supplied services by name; HMRC likewise lists "website supply or web hosting services."

**Business customers.** Between EU states the general B2B rule taxes a service where the customer is established, and Article 196 of the VAT Directive makes VAT payable by the business customer receiving it from a supplier not established in that state: the reverse charge. The customer's VAT number is the trigger, so it is validated. The EU's VIES REST endpoint (`GET .../vies/rest-api/ms/{country}/vat/{number}`) returns `isValid`, a `requestDate`, a `userError` such as `INVALID`, and a `requestIdentifier` that is the evidence to store with the invoice. Validation can fail for reasons other than an invalid number, so a tax ID needs a pending state and a retry, not a binary flag. HMRC is explicit that a customer "can't insist" on business treatment without a valid VAT number.

**Consumers.** B2C electronic services are taxed where the consumer is. The One Stop Shop, since July 1, 2021, lets a seller file one quarterly return for all member states under the Union scheme (EU-established) or the non-Union scheme (no EU establishment), with a €10,000 threshold for single-state EU sellers; supplies in a state where the seller has an establishment go on that state's domestic return instead, which is exactly AWS's branch model.

**Three provider models in the EU:**

| Model | How it works | Who |
| --- | --- | --- |
| **Branches as local vendors** | Local VAT charged in branch states even to businesses with a VAT number, unless a special status applies (international organizations, exemption certificates, Italy's Article 17 split payment); reverse charge elsewhere | AWS EMEA SARL |
| **Account type decides** | Business accounts get no VAT and self-assess; Individual accounts pay local VAT; the type can't be changed later | Google Cloud |
| **VAT ID decides** | Non-business customers pay VAT; adding a valid VAT ID removes it from future invoices | DigitalOcean; Vercel leaves VAT to the customer |

**Outside the EU,** from the providers' pages as of October 2026: UK VAT at 20% since January 1, 2021 for consumers, removed for a valid UK VAT ID with the reverse charge applying (DigitalOcean); Canada GST/HST by province, Québec QST at 9.975%, British Columbia PST at 7% and Saskatchewan PST at 6% since April 1, 2021, and Manitoba RST at 7% since February 1, 2026 at DigitalOcean (Manitoba's own bulletin dates cloud taxability to January 1, 2026, and payments made before then for periods starting before then are untaxed); Australia 10% GST, Japan 10% consumption tax and Indonesia 11% VAT through Google's local reseller entity (Google Cloud); India 18% GST unless a valid GSTIN applies to the right entity. Canada's simplified registrants collect only from consumers, with the customer's GST/HST number as proof of business status, and get no input tax credits.

## US Sales Tax on Hosting, IaaS and SaaS

Mechanics (nexus, registrations, thresholds) are the playbook's ([US Economic Nexus](/docs/payments/sales-tax#us-economic-nexus)). What varies is whether infrastructure is taxable at all, and states split three ways: whether remote use of software is a sale of software, whether hosting, storage and compute are enumerated taxable services, and whether business use is the trigger. As of October 2026, from the statutes, rules and agency guidance:

| State | Hosting, IaaS, storage | SaaS and remote software | Authority |
| --- | --- | --- | --- |
| **Texas** | Taxable data processing: "the computerized entry, retrieval, search, compilation, manipulation, or storage of data or information"; Internet hosting is data processing when the customer stores data on the provider's equipment; 20% of the charge is exempt, so 80% is taxed | Data processing too | 34 TAC 3.330, effective April 2, 2025: out-of-state use exempt to that extent; multistate allocation |
| **New York** | A cloud computing product of instances is "a non-taxable service" | Not addressed in that opinion; DigitalOcean collects on SaaS and PaaS only | TSB-A-15(2)S (April 14, 2015); advisory opinions bind only the petitioner |
| **Washington** | Web hosting and domain registration excluded from information technology services; data processing a retail sale from October 1, 2025 | Remote access software a retail sale; SaaS a digital automated service, separately a retail sale, eligible for a multiple points of use exemption when itemized | ESSB 5814; ESSB 6346's contingent repeal of the IT and data processing provisions from January 1, 2029 |
| **Pennsylvania** | Not addressed for IaaS on the DOR page | Canned software taxable "whether electronically or digitally delivered, streamed or accessed," regardless of billing method (per license, metered or tiered) | 72 P.S. 7201(m)(2); sourced to user location (SUT-12-001); Form REV-1220 allocation |
| **Ohio** | Automatic data processing includes "providing access by any means to computer equipment for the purpose of processing data," taxable only for use in business | Same business-use rule | Ohio Adm. Code 5703-9-46, with a true object test for bundles |

DigitalOcean's published collection list shows what a developer cloud reads from all this: full collection in states including Texas (6.25% state rate), Washington, Pennsylvania, Ohio and Arizona; SaaS only in Iowa, Massachusetts, South Carolina, Tennessee, Utah and several Colorado home-rule cities; SaaS and PaaS only in New York; Connecticut at 1% and Maryland at 3%. That is a provider's reading, not law, but it proves the design point: taxability is per SKU and per state, not per account.

**Domains.** Washington excludes domain name registration from IT services; GoDaddy lists domain registrations among products that "may be" taxed; Stripe Tax's code list has no domain registration code. No state guidance I opened treats registration as its own category otherwise, so a registrar's tax code for domains is a deliberate choice to document.

**Worked example, Texas.** A $100.00 monthly compute line for a Texas customer: 20% is exempt, so $80.00 is taxable; at the 6.25% state rate that is $5.00, plus local tax at up to 2% of $80.00 (up to $1.60). The invoice line stores a `taxable_amount` of 8000 cents, not 10000; a bundle that adds a taxable non-data-processing service to the same charge can lose the separation, which is why lines stay split by tax code.

## Local Cloud Taxes: Chicago

Chicago taxes the lease of personal property used in the city, and since Ruling #12 it reads that to include a "non-possessory computer lease": charges where the customer pays mainly for the ability to use the provider's computer to input, modify or retrieve data. The rate is 15% from January 1, 2026, up from 11%, on leases of property used in Chicago, and lessees accrue it unless they are exempt. AWS lists Chicago as a separate collecting jurisdiction; DigitalOcean charges Chicago customers 15% and has collected there since April 2022.

The amusement tax is a separate Chicago tax on electronically delivered amusements (streaming), affirmed in *Labell*; it reaches a platform that streams video or games, not a VM. Colorado's home-rule cities are the other local case in DigitalOcean's list: Denver, Boulder, Colorado Springs and Englewood on SaaS only, Fort Collins in full, each a jurisdiction of its own.

**Worked example.** A Chicago customer's $100.00 of compute in October 2026 carries $15.00 of lease tax; at the 2025 rate it would have been $11.00. The rate is an effective-dated row, because the City changes it with its budgets.

## Marketplaces and Facilitator Rules

When a provider runs a marketplace for third-party software, it can become the seller for tax purposes. AWS says that "a number of US states and foreign jurisdictions" require marketplace operators "to collect Indirect Taxes in the marketplace operator's/facilitator's own name," and lists the US jurisdictions where it does so, Chicago and Puerto Rico among them. Abroad it acts for sellers country by country: a joint election in Canada so AWS accounts for GST/HST and QST; an Australian GST treatment of supplies through the marketplace; India, where AWS India is the processing party for Indian sellers and withholds under the Income Tax and GST Acts; tax-qualified invoices in Japan under the special agency rule; consigned tax invoices in Korea; Singapore GST invoices issued for Singapore-registered sellers and retained ten years; a section 54(2B) election in South Africa; and VAT added and remitted to Swiss and Colombian registered sellers. Google's Marketplace settlement entities are the same idea expressed as a billing entity.

The general law of marketplace facilitators is the User-Generated Platforms volume's ([Marketplace Facilitator Tax](/books/user-generated-platforms/pricing-and-fees#marketplace-facilitator-tax)); the listing fees and private offers are [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces). For the system, a marketplace line has a different seller of record from the provider's own lines on the same invoice, and its tax is calculated under the facilitator's registrations.

## Withholding Tax and Gross-Up

Cross-border payments for services can attract withholding tax in the payer's country, and cloud contracts push it back to the customer. The AWS Customer Agreement requires payment "free and clear of any deduction or withholding," with the customer paying whatever extra is needed so AWS receives the full amount, and AWS providing forms to reduce withholding (3.2). AWS's India guidance draws the line by entity: buyers should not withhold on payments to AWS India for marketplace purchases, while a buyer withholding on a payment to Amazon Web Services, Inc. bears it "out of its own pocket." For sellers it runs the other way: non-Indian marketplace sellers supply a no-permanent-establishment declaration, a tax residency certificate and a Form 10F every year.

Two design points follow. A short payment equal to a withholding rate is not a dispute or a partial payment to dun: it is a withholding event, matched to the invoice with the customer's certificate, and either still owed under a gross-up clause or settled by a credit note with reason `withholding_tax` where the contract accepts it. And the residency certificates a provider supplies to customers expire, so they are documents with dates, like exemption certificates.

Digital services taxes are a different instrument, aimed at platforms, advertising and marketplaces rather than infrastructure rent. Canada's was repealed with Royal Assent on March 26, 2026, and the CRA refunds all DST paid, with interest; a cloud's exposure to the others is through its marketplace and advertising lines, which the User-Generated Platforms volume covers for platforms.

## Telecom Taxes and Regulatory Fees

A CPaaS selling voice and messaging collects three kinds of money that look alike on an invoice and aren't:

| Kind | Examples | Who imposes it, on whom | How it's sourced | On the invoice |
| --- | --- | --- | --- | --- |
| **Regulatory contribution recovery** | Federal Universal Service Fund | The FCC assesses the provider on interstate and international end-user revenue; the provider may recover it from customers | Interstate share of telecom revenue | A pass-through line, revenue to the provider, capped by the factor |
| **Taxes and surcharges on the user** | State and local 911 and 988 surcharges, utility users' taxes, access line taxes | The state or city imposes it on the customer; the provider collects | Service address, per line or per charge | A tax line, a liability |
| **Carrier fees** | 10DLC and per-message carrier surcharges | The carrier charges the provider | Recipient carrier | A pass-through line ([Pass-Through Fees](/books/hosting-and-cloud/metering-and-rating#pass-through-fees)) |

**The USF factor.** The contribution factor is the ratio of projected program costs to contributors' projected interstate and international end-user revenues, net of contributions, recalculated every quarter. For the fourth quarter of 2026 (DA 26-946, released September 14, 2026, CC Docket 96-45): $2.02619 billion of program collection over an adjusted base of ($6.909925 billion − $2.026190 billion) × 0.99 = $4.834898 billion gives 0.419076, rounded up to 42.0%. The factor is deemed approved if the FCC doesn't act within 14 days, and "carriers may not ... recover through a federal universal service line item an amount that exceeds 42.0 percent of the interstate telecommunications charges on a customer's bill." Bandwidth's 10-K says its USF assessments "are generally passed on to our customers," and that states may assess state USF on VoIP providers' intrastate revenue. The Supreme Court upheld the scheme on June 27, 2025.

**The interstate share.** Interconnected VoIP providers may report interstate revenue using a 64.9% safe harbor, per the 2026 FCC Form 499-A instructions as USAC presents them, instead of a traffic study or actual revenues. **Worked example:** $100.00 of interconnected VoIP service in the fourth quarter of 2026, under the safe harbor, has $64.90 of interstate charges, and the federal USF line can be at most 42.0% of that, $27.26. In the data, the USF recovery is a pass-through SKU whose quarterly price version is the factor, applied to the line's interstate amount.

**State and local.** California's 911 surcharge is $0.41 per access line per month for 2026 and its 988 surcharge $0.05 (down from $0.08), set by Cal OES by October 1 for the next calendar year; Cal OES counted 4,140,208 VoIP lines among 47,533,701 access lines for 2025. These are per-line amounts, not percentages, so a tax line needs units and a per-unit amount. Local telecom taxes are litigated: Bandwidth reports litigation over billing, collecting and remitting non-income taxes on 911 services "in California and Illinois," and its own suit against San Francisco over 911-related taxes. Every telecom line therefore needs a service type and a verified service address, not just a billing address; the ownership of the 911 duties themselves is 911, CPNI & Telecom Duties.

## Exemptions and Tax Codes per SKU

- **A tax code per SKU, not per product.** DigitalOcean's SaaS-only states mean a managed application and a droplet in the same product family need different codes. Stripe Tax's catalog splits infrastructure by kind and by buyer: IaaS business `txcd_10101000` and personal `txcd_10010001`, PaaS business `txcd_10102000` and personal `txcd_10102001`, SaaS personal `txcd_10103000` and business `txcd_10103001`, Website Hosting `txcd_10701100`, Website Data Processing `txcd_10701300`, AI as a service codes `txcd_10105001` to `txcd_10105004` (since April 1, 2026), and a general electronically supplied services code `txcd_10000000`. FastSpring's catalog exposes `SW054002` for SaaS and restricts `SW050403`, website hosting, by default. Neither Stripe's list nor these tables has a code for domain registration or for telecommunications. The business and personal split exists because some states tax by use (Ohio's business-only rule), so the SKU carries both and the customer type picks one ([A Tax Code Per Item](/docs/payments/sales-tax#a-tax-code-per-item)).
- **Exemption certificates as documents with expiry.** AWS reviews uploaded US exemption documents within 24 hours and keeps an exemption active until the certificate expires; DigitalOcean routes certificates through Ryan ControlPoint and shows "Not Exempt - forms pending review," "Exempt" or "Not Exempt" with a reason, reviewed each billing cycle ([Exemptions Are Documents](/docs/payments/sales-tax#exemptions-are-documents)).
- **Tax registration numbers through an API.** AWS's Tax Settings API (`PutTaxRegistration`, `BatchPutTaxRegistration`, `GetTaxRegistrationDocument`) needs registration documents only for Bangladesh, Kenya, South Korea and Spain, stored in the customer's S3 bucket under a service-principal policy. Large customers set tax IDs across many accounts at once, and inheritance across an organization is a setting with consequences: turning it off reverts member accounts.
- **Invoices are immutable for tax.** Microsoft doesn't regenerate past invoices after a sold-to change; Vercel applies billing detail changes to future invoices only. A tax correction is a credit note at the original rates ([Tax Is a Quote Until the Invoice Finalizes](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes)).

## The Alternatives

| Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- |
| **Local seller entities per country** | Local currency, local invoices, withholding avoided | Entity overhead, transfer pricing, many registrations | Highest | AWS, Google Cloud |
| **One regional entity with branches** | One contract for a region, local VAT where branches are | Charging VAT to businesses in branch states surprises customers | High | AWS EMEA SARL |
| **One entity, OSS and reverse charge** | Simple: one return for EU consumers, businesses self-assess | Every consumer sale needs location evidence; registrations elsewhere one by one | Moderate | DigitalOcean |
| **US entity, customers self-assess VAT** | Minimal compliance abroad | Exposure where non-resident registration is required for consumer sales | Low | Vercel |
| **Merchant of record or reseller** | Someone else's registrations and filings | Margin, control of the customer, fit for usage billing | Fee per transaction | Smaller SaaS; resellers of cloud |
| **Tax engine with SKU codes** | Rates and rules maintained by a vendor | Codes chosen wrong; no codes for domains and telecom | Per-transaction fees | Most providers, with Stripe Tax, Avalara or Vertex |

## My Default

My default for a provider selling infrastructure internationally is one selling entity per region where the customer base justifies it, with registrations as dated rows (OSS for EU consumers, domestic registrations where the provider has an establishment, simplified non-resident registrations for Canada and similar regimes), a tax engine fed one code per SKU in business and consumer variants, and a published location precedence with the evidence stored per invoice. I'd decide business status from a validated tax ID with a pending state, not from a sign-up checkbox and not irreversibly at account creation, and I'd keep the provider's own revenue, pass-through fees and collected taxes in separate line kinds so the margin, the remittance and the customer's invoice all read correctly.

For telecom I'd put the provider's USF recovery on a pass-through SKU priced quarterly from the FCC's factor and the declared interstate share, and every user-imposed tax and surcharge on tax lines sourced to a verified service address. What would change this: a small provider selling mostly to consumers abroad, where a merchant of record is cheaper than registrations; or a provider with no telecom lines, which can skip the communications tax engine entirely.

## How to Build It

The chapter adds seller entity columns on the Payments volume's `merchants`, seller routing rules, tax registrations, customer tax IDs and addresses, exemption certificates and withholding certificates, and extends the playbook's `invoice_line_taxes` for telecom and per-unit taxes. It uses `accounts.customer_type` from [Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law#how-to-build-it).

```sql
-- Seller entities -----------------------------------------------------------

ALTER TABLE merchants                     -- each selling legal entity is a merchant
  ADD COLUMN entity_code        TEXT UNIQUE,      -- 'seller.emea', 'seller.us', 'seller.telecom.eu'
  ADD COLUMN entity_roles       TEXT[] NOT NULL DEFAULT '{seller_of_record}',
                                  -- 'seller_of_record', 'contracting', 'settlement_billing'
  ADD COLUMN registered_address TEXT,
  ADD COLUMN invoice_currency   CHAR(3),
  ADD COLUMN contracting_merchant_id UUID REFERENCES merchants (id);  -- billing entity's principal

CREATE TABLE seller_entity_rules (       -- which entity sells what to whom, dated
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  country       CHAR(2),                 -- null: catch-all
  product_id    UUID REFERENCES products (id),   -- null: any; telecom products route apart
  channel       TEXT NOT NULL DEFAULT 'direct' CHECK (channel IN ('direct', 'marketplace')),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  priority      SMALLINT NOT NULL,       -- most specific wins
  valid_during  TSTZRANGE NOT NULL
);

CREATE TABLE tax_registrations (         -- where each entity collects, and under what scheme
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id         UUID NOT NULL REFERENCES merchants (id),
  jurisdiction        TEXT NOT NULL,     -- 'DE', 'US-TX', 'US-IL-CHICAGO', 'CA-MB', 'EU'
  tax_type            TEXT NOT NULL CHECK (tax_type IN ('vat', 'gst', 'sales', 'use',
                        'lease', 'telecom', 'usf')),
  scheme              TEXT NOT NULL CHECK (scheme IN ('domestic', 'branch', 'oss_union',
                        'oss_non_union', 'simplified_non_resident', 'marketplace_facilitator',
                        'simplified_sellers_use_tax', 'regulatory_contributor')),
  registration_number TEXT NOT NULL,
  filing_frequency    TEXT CHECK (filing_frequency IN ('monthly', 'quarterly', 'annual')),
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (merchant_id WITH =, jurisdiction WITH =, tax_type WITH =,
    valid_during WITH &&)                -- one registration per entity, place and tax at a time
);

-- The customer side ---------------------------------------------------------

CREATE TABLE account_tax_ids (           -- validated, with evidence and a pending state
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  kind            TEXT NOT NULL,         -- 'eu_vat', 'gb_vat', 'in_gstin', 'ca_gst_hst', 'au_abn'
  country         CHAR(2) NOT NULL,
  value           TEXT NOT NULL,         -- normalized
  status          TEXT NOT NULL CHECK (status IN ('pending', 'valid', 'invalid',
                    'unverifiable')),    -- unverifiable: the registry was down; retry
  verified_at     TIMESTAMPTZ,
  verification_ref TEXT,                 -- e.g. the VIES requestIdentifier
  valid_during    TSTZRANGE NOT NULL
);

CREATE TABLE account_tax_addresses (     -- one per scope that has its own place of use
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  scope_kind    TEXT NOT NULL CHECK (scope_kind IN ('account', 'project', 'subscription',
                  'resource')),          -- resource: a phone number's service address
  scope_id      UUID NOT NULL,
  purpose       TEXT NOT NULL CHECK (purpose IN ('sold_to', 'service_address')),
  country       CHAR(2) NOT NULL,
  subdivision   TEXT,
  locality      TEXT,
  postal_code   TEXT,
  geocode       TEXT,                    -- the engine's jurisdiction code, for telecom
  verified_by   TEXT,                    -- the address verification service, if any
  valid_during  TSTZRANGE NOT NULL
);

CREATE TABLE exemption_certificates (    -- the playbook's "certificate as a document"
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  jurisdictions TEXT[] NOT NULL,
  reason        TEXT NOT NULL CHECK (reason IN ('resale', 'government', 'nonprofit',
                  'multiple_points_of_use', 'direct_pay', 'other')),
  number        TEXT,
  issued_on     DATE,
  expires_on    DATE,
  document_ref  TEXT NOT NULL,           -- stored file or the certificate portal's id
  status        TEXT NOT NULL CHECK (status IN ('pending_review', 'accepted', 'rejected',
                  'expired')),
  reviewed_by   TEXT,                    -- typed actor
  reviewed_at   TIMESTAMPTZ
);

CREATE TABLE withholding_certificates (  -- a customer's proof of tax withheld on our invoice
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  invoice_id    UUID NOT NULL REFERENCES invoices (id),
  country       CHAR(2) NOT NULL,
  amount        BIGINT NOT NULL CHECK (amount > 0),
  currency      CHAR(3) NOT NULL,
  document_ref  TEXT NOT NULL,
  treatment     TEXT NOT NULL CHECK (treatment IN ('gross_up_owed', 'accepted_credit_note')),
  credit_note_id UUID REFERENCES credit_notes (id)
);

-- Catalog: a code per SKU, in both buyer variants ------------------------------
ALTER TABLE skus
  ADD COLUMN tax_code_business TEXT,     -- e.g. an IaaS business-use code
  ADD COLUMN tax_code_consumer TEXT,     -- the personal-use variant
  ADD COLUMN interstate_share  NUMERIC(5,4);  -- telecom SKUs: 0.649 under the VoIP safe harbor

-- Invoices record where tax was sourced, and with what evidence:
ALTER TABLE invoices
  ADD COLUMN tax_location JSONB;         -- {"country":"DE","basis":"tax_id","evidence":[...]}

-- The playbook's tax lines, widened for telecom and per-line surcharges:
ALTER TABLE invoice_line_taxes
  DROP CONSTRAINT invoice_line_taxes_tax_type_check,
  ADD CONSTRAINT invoice_line_taxes_tax_type_check CHECK (tax_type IN ('sales', 'use', 'vat',
    'gst', 'lease', 'telecom', 'surcharge', 'excise')),
  DROP CONSTRAINT invoice_line_taxes_engine_check,
  ADD CONSTRAINT invoice_line_taxes_engine_check CHECK (engine IN ('avalara', 'stripe_tax',
    'vertex', 'communications_engine', 'manual')),
  ADD COLUMN units                    NUMERIC,        -- access lines, for per-line surcharges
  ADD COLUMN per_unit_amount          NUMERIC(12,6),  -- 41 cents of 911 surcharge per line
  ADD COLUMN tax_registration_id      UUID REFERENCES tax_registrations (id),
  ADD COLUMN exemption_certificate_id UUID REFERENCES exemption_certificates (id),
  ADD COLUMN account_tax_id_id        UUID REFERENCES account_tax_ids (id);  -- reverse charge
```

Routing an account (or a marketplace line) to its seller, at the instant of invoicing:

```sql
SELECT r.merchant_id
FROM seller_entity_rules r
JOIN accounts a ON a.id = $1
WHERE (r.country = a.country OR r.country IS NULL)
  AND (r.product_id = $2 OR r.product_id IS NULL)
  AND r.channel = $3
  AND r.valid_during @> $4::timestamptz
ORDER BY (r.country IS NOT NULL) DESC, (r.product_id IS NOT NULL) DESC, r.priority
LIMIT 1;
```

The engine call per line sends the SKU's code for the account's `customer_type`, the sourced address and any valid tax ID; the line is taxed only where the selling entity holds a registration in force on the invoice date:

```sql
SELECT il.id AS invoice_line_id, il.amount,
       CASE a.customer_type WHEN 'business' THEN s.tax_code_business
                            ELSE s.tax_code_consumer END AS tax_code,
       i.tax_location,
       tid.id AS account_tax_id_id,
       ARRAY(SELECT tr.id FROM tax_registrations tr
             WHERE tr.merchant_id = i.merchant_id
               AND tr.valid_during @> NOW()) AS registrations_in_force
FROM invoice_lines il
JOIN invoices i ON i.id = il.invoice_id
JOIN accounts a ON a.id = i.account_id
JOIN skus s ON s.id = il.sku_id
LEFT JOIN account_tax_ids tid ON tid.account_id = a.id AND tid.status = 'valid'
  AND tid.valid_during @> NOW()
WHERE il.invoice_id = $1 AND il.line_kind IN ('usage', 'charge', 'pass_through');
```

Notes on the sketch:

- **The seller is resolved per line.** Most lines take the account's `seller_merchant_id`; telecom products and marketplace lines can route to another entity, which then numbers the invoice in its own series ([Numbers, Lines and Tax](/books/payments/checkout-and-invoicing#numbers-lines-and-tax)). One customer can receive two invoices for one month, one per entity.
- **Registrations decide collection, and the engine is told.** An engine returns zero where the entity isn't registered; `invoice_line_taxes.tax_registration_id` makes every tax line point to the registration it was collected under, and a zero with no registration and no exemption is an alert ([Tax Engines](/docs/payments/sales-tax#tax-engines)).
- **Partial bases are taxable amounts.** Texas's 20% exemption shows as a `taxable_amount` of 80% of the line, with the reason; Chicago's lease tax is a `lease` row; California's 911 surcharge is a `surcharge` row with `units` and `per_unit_amount`.
- **USF is not a tax line.** The provider's recovery is a pass-through SKU (`skus.pass_through = 'regulatory'`) rated quarterly: its price version for the fourth quarter of 2026 is 0.42 per unit of interstate charge, applied to `amount × interstate_share`, so the cap is enforced by construction and the factor changes on a dated row ([Metering & Rating](/books/hosting-and-cloud/metering-and-rating#pass-through-fees)).
- **Tax IDs have a pending state.** A VIES timeout makes the ID `unverifiable` and the invoice is taxed as consumer until it validates, with a credit note if the customer later proves status for that invoice date, where the rules allow it.
- **Location is stored with the invoice.** `invoices.tax_location` records the basis (tax ID country, matching card, billing or contact address, service address) and the evidence used, so the answer to "why German VAT" is on the document.
- **Events:** `tax_id.validated`, `tax_id.invalidated`, `exemption.accepted`, `exemption.expiring`, `registration.started`, `registration.ended`, `seller_entity.reassigned` and `invoice.tax_committed` go through the outbox to billing, the customer console and finance.

## Auditing

- **Every tax line to its registration, rule and evidence.** The selling entity, the registration in force, the tax code sent, the location basis and evidence, and the engine's transaction ID.
- **Every zero explained.** Reverse charge with the validated tax ID and its VIES reference, an exemption with its accepted certificate, a non-taxable code, or no registration, each a reason, never a bare zero.
- **Seller entity history.** Which entity sold to each account on each date, so a reassignment can't make an old invoice look as if another entity issued it.
- **Telecom contributions and surcharges.** The USF factor applied each quarter against the published public notice, the interstate share used, and per-line surcharges against reported access lines, because regulators and auditors reconcile to those counts.
- **Registrations against thresholds and law changes.** When each registration started, why, and which rule changes (Washington's 2029 provisions, Chicago's rate, a new province) are pending as dated rows ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Treat the seller as a routed, dated choice per line,** with entities as merchants and branches as registrations.
- **Publish and store the location precedence,** with the evidence used on every invoice.
- **Decide business status from validated tax IDs** with a pending state, and keep the decision reversible.
- **Give every SKU a tax code in business and consumer variants,** because states split hosting, IaaS and SaaS differently.
- **Model partial bases, local lease taxes and per-line surcharges** as tax line data, not special cases in code.
- **Keep USF recovery a pass-through SKU priced quarterly,** separate from taxes the provider collects for governments.
- **Store exemption and withholding certificates as documents with dates,** linked from the lines and invoices they justify.
- **Track contingent and pending law as dated rows,** Washington's 2029 provisions first among them.

## References

**Law and regulation**

- [Commission Implementing Regulation (EU) 282/2011, Annex I](https://www.legislation.gov.uk/eur/2011/282/annex/I/adopted), website hosting, remote systems administration, online data warehousing, on-demand disk space and software access as electronically supplied services
- [VAT Directive 2006/112/EC, Article 196](https://www.legislation.gov.uk/eudr/2006/112/article/196), the reverse charge on services from a supplier not established in the member state
- [European Commission: One Stop Shop](https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en), OSS from July 1, 2021, MOSS from January 1, 2015, the schemes, quarterly returns, the €10,000 threshold and supplies where the seller is established
- [European Commission: VIES REST check](https://ec.europa.eu/taxation_customs/vies/rest-api/ms/DE/vat/123456789), the response fields `isValid`, `requestDate`, `userError` and `requestIdentifier`
- [HMRC: VAT rules for digital services to private consumers](https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers), web hosting as a digital service, the VAT number for business treatment, registration for non-UK businesses
- [Canada Revenue Agency: GST/HST and electronic commerce](https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/federal-government-budgets/faq-relation-electronic-commerce-supplies.html), simplified registration from July 1, 2021, the C$30,000 threshold, residence indicators and no input tax credits
- [Manitoba: Information Bulletin RST 033](https://www.gov.mb.ca/finance/taxation/pubs/bulletins/033.pdf), cloud computing taxable from January 1, 2026, the transition rule, non-resident collection and proration
- [Canada: Digital services tax](https://www.canada.ca/en/services/taxes/excise-taxes-duties-and-levies/digital-services-tax.html), repeal with Royal Assent on March 26, 2026 and refunds with interest
- [Congressional Research Service: The Internet Tax Freedom Act (R43772)](https://www.everycrsreport.com/reports/R43772.html), what ITFA prohibits, P.L. 114-125 and VoIP's exclusion
- [EY: ITFA's prohibition applies to all states from July 1, 2020](https://taxnews.ey.com/news/2020-1436-internet-tax-freedom-acts-prohibition-against-taxing-internet-access-applies-to-all-states-beginning-july-1-2020), the 1998 enactment, the grandfather clause's end on June 30, 2020 and the six states
- [34 Tex. Admin. Code 3.330](https://www.law.cornell.edu/regulations/texas/34-Tex-Admin-Code-SS-3.330), data processing, Internet hosting, the 20% exemption, out-of-state use and allocation, effective April 2, 2025
- [New York TSB-A-15(2)S](https://tax.ny.gov/pdf/advisory_opinions/sales/a15_2s.pdf), April 14, 2015: a cloud computing product as a non-taxable service
- [Washington DOR: Interim guidance on ESSB 5814 information technology services](https://dor.wa.gov/laws-rules/interim_guidance_statements/interim-guidance-statement-regarding-changes-made-essb-5814-information-technology-services), retail sale from October 1, 2025, data processing, and the web hosting, domain registration and SaaS exclusions
- [Washington Legislature: ESSB 6346 bill summary](https://app.leg.wa.gov/billsummary?BillNumber=6346&Year=2026), chapter 238, Laws of 2026, signed March 30, 2026
- [Washington: ESSB 6346 session law](https://lawfilesext.leg.wa.gov/biennium/2025-26/Pdf/Bills/Session%20Laws/Senate/6346-S.SL.pdf), sections 1001 and 1002 effective January 1, 2029 and the null-and-void clause in section 1202
- [Pennsylvania DOR: Canned computer software and digital goods](https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/sales-use-and-hotel-occupancy-tax/canned-computer-software-digital-goods.html), taxability whether accessed or streamed, billing method, user-location sourcing and Form REV-1220
- [Ohio Adm. Code 5703-9-46](https://codes.ohio.gov/oac/5703-9-46), automatic data processing including access to computer equipment, for business use, and the true object test
- [Sales Tax Institute: Chicago personal property lease transaction tax increase for 2026](https://www.salestaxinstitute.com/resources/chicago-personal-property-lease-transaction-tax-increase-2026), the 15% rate from January 1, 2026, the prior 11%, non-possessory computer leases
- [Jones Day: Chicago rulings on web-based entertainment and cloud](https://www.jonesday.com/en/insights/2015/08/city-of-chicagos-department-of-finance-issues-rulings-impacting-web-based-entertainment), Lease Transaction Tax Ruling #12 and Amusement Tax Ruling #5, issued June 9, 2015, effective September 1, 2015
- [JD Supra: In Chicago, taxing the cloud will wait](https://www.jdsupra.com/legalnews/in-chicago-taxing-the-cloud-will-wait-63952/), the delay to January 1, 2016
- [Labell v. City of Chicago, 2019 IL App (1st) 181379](https://www.illinoiscourts.gov/Opinions/AppellateCourt/2019/1stDistrict/1181379.pdf), filed September 30, 2019, affirming the amusement tax on streaming against the ITFA claim
- [FCC: Proposed fourth quarter 2026 universal service contribution factor (DA 26-946)](https://docs.fcc.gov/public/attachments/DA-26-946A1.pdf), the 42.0% factor, the formula and figures, deemed approval and the line-item cap
- [FCC v. Consumers' Research, No. 24-354 (June 27, 2025)](https://www.supremecourt.gov/opinions/24pdf/24-354_0861.pdf), the universal service scheme upheld, opinion by Justice Kagan
- [USAC: 2026 FCC Form 499-A training for VoIP providers](https://www.usac.org/wp-content/uploads/service-providers/documents/training/2026/2026-499A-Series-VoIP-Providers.pdf), the 64.9% VoIP safe harbor
- [Cal OES: 911 and 988 surcharge rates for calendar year 2026](https://www.caloes.ca.gov/wp-content/uploads/PSC/Documents/CDTFA-Access-Line-Letter-CY-2026.pdf), $0.41 and $0.05, access line counts including VoIP, the October 1 setting date
- [CDTFA: 911 and 988 surcharges](https://cdtfa.ca.gov/taxes-and-fees/mts.htm), rates per access line per month and who collects them

**Provider documentation and terms**

- [AWS: Finding the seller of record](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/finding-the-seller-of-record.html), the seller of record table, assignment from billing and contact information, and billing transfer
- [AWS: European Union tax help](https://aws.amazon.com/tax-help/european-union/), AWS EMEA SARL from July 1, 2018, branch countries and dates, special statuses, AMCS LLC for telecom
- [AWS: How AWS determines the location of your account](https://aws.amazon.com/tax-help/location/), the location precedence and separate assessment of linked accounts
- [AWS: United States tax help](https://aws.amazon.com/tax-help/united-states/), 53 jurisdictions including Chicago, payment method address, exemptions and Alabama's 8% simplified sellers use tax
- [AWS: Setting up your tax information](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-account-payment.html), tax settings inheritance, exemption review within 24 hours, the Tax Settings API and the countries requiring documents
- [AWS Marketplace: Tax services](https://docs.aws.amazon.com/marketplace/latest/userguide/tax-services.html), the country-by-country mechanisms for sellers
- [AWS Marketplace: Tax help](https://aws.amazon.com/tax-help/marketplace/), marketplace facilitator collection in AWS's own name and the US jurisdictions
- [AWS: India marketplace buyers](https://aws.amazon.com/tax-help/india/india-marketplace-buyers/), withholding on payments to AWS India and to AWS Inc.
- [AWS Customer Agreement](https://aws.amazon.com/agreement/), taxes exclusive of indirect tax and the withholding gross-up (3.2)
- [Google Cloud: VAT and tax overview](https://docs.cloud.google.com/billing/docs/resources/vat-overview), Google Payment Corp since September 1, 2023, the immutable account type, EU treatment, Italy, India, Indonesia, Canada, Australia and Japan
- [Google Cloud: Marketplace contracting and settlement billing entities](https://support.google.com/cloud/answer/13855075), Google Cloud EMEA Limited, Google Cloud France SARL, Google Payments Limited and Google Payments Ireland Limited
- [Microsoft Learn: Update tax details for an Azure billing account](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/manage-tax-information), sold-to and ship-to, billing profiles and subscriptions, no regeneration of past invoices, tax ID countries
- [DigitalOcean: US sales tax](https://docs.digitalocean.com/platform/billing/taxes/usa/), collecting states and cities with rates, start dates and SaaS-only qualifiers, and the exemption process
- [DigitalOcean: EU VAT](https://docs.digitalocean.com/products/billing/taxes/eu/), VAT for non-business customers and the VAT ID
- [DigitalOcean: UK VAT](https://docs.digitalocean.com/products/billing/taxes/gbr/), 20% since January 1, 2021 and the reverse charge for UK VAT IDs
- [DigitalOcean: Canadian taxes](https://docs.digitalocean.com/products/billing/taxes/can/), GST/HST, QST, BC and Saskatchewan PST and Manitoba RST with dates
- [Vercel: Billing FAQ for the Pro plan](https://vercel.com/docs/plans/pro-plan/billing), a US entity without a VAT ID and future-only invoice detail changes
- [GoDaddy: Tax on digital products and services](https://www.godaddy.com/help/godaddy-tax-on-digital-products-and-services-24721), domains, hosting and SaaS that may be taxed, by billing address
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), USF passed on to customers, state USF on VoIP, messaging surcharges passed through, 911 tax litigation

**Reference**

- [Stripe: Product tax codes](https://docs.stripe.com/tax/tax-codes), IaaS, PaaS, SaaS, hosting, data processing, AI as a service and general codes, and no domain or telecom codes
- [FastSpring: Tax category selection helper](https://developer.fastspring.com/docs/tax-category-selection-helper/), SW054002 for SaaS and the restricted SW050403 for website hosting
