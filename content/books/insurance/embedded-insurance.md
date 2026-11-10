+++
title = "Embedded Insurance"
description = "Insurance sold inside another product's flow: licensing models, what a partner may say, opt-in and disclosure law, revenue share, and the offer-to-claim API."
category = "Insurance Industry"
order = 2767
part = "Embedded Insurance and Service Contracts"
tags = ["insurance", "embedded-insurance", "limited-lines", "distribution", "api-design", "consumer-protection"]
+++

Embedded insurance is coverage offered at the moment someone buys something else: trip protection on a flight, damage coverage on a rental car, a protection plan on a phone, shipping protection on an order, renters insurance at lease signing, an auto policy at car purchase. The buyer never visits an insurer. The seller (an airline, a rental counter, a retailer, a lender, a marketplace) presents an offer inside its own checkout, collects the money with its own payment, and passes the policy to an insurer or administrator behind the scenes. Every rule of distribution still applies: someone must be licensed to sell, solicit or negotiate, the product must be filed in the state, the disclosures must be given, and the compensation must be lawful. What changes is that the person doing the selling is a checkout page or a rental agent whose job is something else.

This chapter covers the licensing models that make that possible (a full producer license, a limited lines license, a referral arrangement, or a product that isn't insurance at all), what an unlicensed partner may and may not say, the disclosure and opt-in law that governs the checkout, how the money is split, and the shape of the API between partner and insurer. Travel insurance at checkout has its own model act and is in [Selling Travel at Checkout](/books/insurance/pet-and-travel#selling-travel-at-checkout); renters insurance required by a lease is in Property Tech's [Renters Insurance Requirements](/books/property-tech/insurance-deposits-and-guarantees#renters-insurance-requirements); a marketplace's host and guest protection is in User-Generated Platforms' [Insurance Law: Who May Sell It](/books/user-generated-platforms/deposits-and-protection#insurance-law-who-may-sell-it). Products sold at checkout that are service contracts rather than insurance are in [Service Contracts & Warranties](/books/insurance/service-contracts).

## How the Platforms Do It

As of November 2026, from each company's 10-K or its own pages:

| Company | Model | Public detail |
| --- | --- | --- |
| **Allstate Protection Services** | Protection plans through retailers and mobile operators; vehicle service contracts and GAP waivers through dealers | 5.0% of Allstate's 2025 revenue but 81.6% of its policies in force at December 31, 2025; Allstate Protection Plans sells "consumer protection plans and related technical support for mobile phones, consumer electronics and major appliances" through retailers and mobile operators, in store or online |
| **Assurant** | Business-to-business-to-consumer through partners | Global Lifestyle earned $9,582.5 million in 2025 (Connected Living $5,378.7 million, Global Automotive $4,203.8 million); Global Housing $2,768.8 million, of which renters and other $576.4 million; describes "business-to-business-to-consumer (B2B2C) distribution, partnered with some of the world's leading brands," with client agreements generally of three to five years |
| **bolttech** | Insurance exchange and embedded API | Launched in 2020; 39 markets, over 700 distribution partners, over 7,000 products and more than US$90 billion of quoted premiums a year (its figures); an "Embedded API" for quote, bind and pay |
| **Boost** | Full-stack platform for MGAs and embedded programs | White-label products on "A" and "A-" rated carrier paper with dedicated reinsurance capacity, an API-driven policy administration system, an agency management portal, and Boost Re for partners who want to take their own risk |
| **Cover Genius (XCover)** | Global embedded distribution | "Licensed or authorized in over 60 countries and 50 US states"; a single API returning prices and product recommendations in real time; policy content in 40+ languages and claim payments in 90+ currencies; partners shown include Booking Holdings, Amazon, Uber, Ryanair, eBay, Wayfair and ShipStation |
| **Extend** | Product protection and shipping protection for merchants | A public API: offers per product, orders and line items, contracts created when line items are fulfilled, refunds, claims and claim status webhooks |
| **Root** | Embedded auto insurance with partners | An embedded product with Carvana, alongside direct and agency channels ([Agents, Brokers & Channels](/books/insurance/agents-brokers-and-channels)) |

Three patterns run through the table. **The partner owns the moment, the insurer owns the paper.** Assurant, Allstate and Cover Genius sell through brands whose customers they never market to directly, and the insurer of record (or the obligor, for a service contract) is a name in the fine print. **The integration is the product.** bolttech, Boost, Cover Genius and Extend all lead with an API, because a program that takes a quarter to integrate doesn't launch. **The same checkout sells two legal kinds of thing.** A phone protection plan may be insurance in one program and a service contract in another, and Allstate's dealer channel sells both vehicle service contracts (not insurance in most states) and GAP waivers (a loan term, not insurance) next to each other. The system has to know which one it is selling, because licensing, filing, tax and refund rules all follow from that.

## Who May Sell It: Four Licensing Models

The NAIC Producer Licensing Model Act (#218) starts from a flat rule: "A person shall not sell, solicit or negotiate insurance in this state for any class or classes of insurance unless the person is licensed for that line of authority." The three verbs are defined. To **sell** is "to exchange a contract of insurance by any means, for money or its equivalent, on behalf of an insurance company." To **solicit** is "attempting to sell insurance or asking or urging a person to apply for a particular kind of insurance from a particular company." To **negotiate** is "conferring directly with or offering advice directly to a purchaser or prospective purchaser of a particular contract of insurance concerning any of the substantive benefits, terms or conditions of the contract." A checkout that shows a price and an "Add coverage" button is soliciting by that definition, so every embedded program picks one of four ways to make it lawful ([Who Must Be Licensed](/books/insurance/producer-licensing#who-must-be-licensed)).

**1. The partner, or a subsidiary, becomes a licensed agency.** The partner forms an insurance agency, licenses it in every state where it sells (resident in one, nonresident elsewhere), designates a responsible licensed producer, and appoints with the insurers it sells for. Its employees who discuss coverage are licensed individuals. This is the heaviest model and the most flexible: the agency can sell any product its lines of authority cover and earn commission on it. Marketplaces that sell host and guest coverage often take this route, as UGP's chapter describes.

**2. The partner holds a limited lines license.** States carve out narrow licenses for coverage incidental to another sale. The model act defines **limited lines insurance** as the lines a state's limited line statute names "or any other line of insurance that the insurance commissioner deems necessary to recognize," and gives a nonresident limited lines licensee the same scope its home state grants. Florida's list (Fla. Stat. 626.321) shows what the category covers in practice:

| Florida limited license | What it allows | Conditions that become system rules |
| --- | --- | --- |
| **Travel insurance** (1)(c) | A travel retailer offers coverage under a limited lines travel insurance producer's license | Retailers on the producer's register on the department website and appointed; a designated responsible producer who "must be a licensed insurance producer"; trained employees; brochures saying travel insurance is not required; unlicensed staff may not interpret terms or advise on existing coverage |
| **Motor vehicle rental insurance** (1)(d) | A rental company or a general lines agent's salaried employee sells excess liability, damage to the rental, personal effects and accidental injury tied to the rental | Rentals of up to 60 days, one extension of up to 60 more; written notice that the renter's own policy may already cover these risks and that buying is not required; each location listed, new ones reported before sales begin, closed ones within 30 days; the entity is "directly responsible and accountable for all acts of the licensee's employees" |
| **Credit insurance** (1)(e) | A lender or its employees sell credit life, disability, property, unemployment, GAP and similar coverage | Sales only to the lender's own borrowers |
| **In-transit and storage personal property** (1)(g) | A self-storage or vehicle lessor's employees issue certificates | Written notice that a homeowners policy may already cover the goods and that the lease does not require the purchase |
| **Portable electronics or eyewear** (1)(h) | A retail vendor's lead location, under contract with a general lines agent, sells coverage for loss, theft, malfunction or damage | Unlicensed employees may sell at a licensed location if supervised and trained, but "may not be paid commissions" on the sales (incidental pay inside a broader compensation plan is allowed); brochures on duplication of coverage, optional enrollment, terms, claims, returns and the right to cancel with a refund of unearned premium; premiums held in trust for the insurer and remitted within 60 days |

Two cross-cutting Florida rules apply to every limited license: each insurer needs its own appointment, and only policies of an authorized insurer or an eligible surplus lines insurer may be sold under one. The model act itself names only credit as a limited line by default; which other limited lines a state recognizes, and what each requires, is state law, and the rules above are Florida's. <!-- source-gap: limited-lines-by-state | missing | a dated multistate compilation of limited lines licenses (rental car, portable electronics, self-storage, travel) and their employee-licensing and compensation conditions | closes with: an NAIC or NIPR limited lines chart, or each state's statute opened | checked: 2026-11-10 --> I have Florida's statute open; I haven't found a dated multistate chart, so a system should load each state's conditions from that state's statute.

**3. The partner refers and doesn't sell.** The model act's commission section bars an insurer or producer from paying "a commission, service fee, brokerage or other valuable consideration" to an unlicensed person for selling, soliciting or negotiating, and bars that person from accepting it (Section 13A and B). Section 13D is the opening: an insurer or producer "may pay or assign commissions, service fees, brokerages or other valuable consideration to an insurance agency or to persons who do not sell, solicit or negotiate insurance in this state," unless the payment violates the state's anti-rebating law. A partner that sends a customer to a licensed agency's page, says nothing about the coverage beyond that it exists, and is paid for the referral rather than the sale sits here. The line is the definitions: once the partner's page urges the customer to buy a particular insurer's product or explains what it covers, it is soliciting. Section 4B(2) adds a narrower exemption for a person who "performs administrative services related to mass marketed property and casualty insurance; where no commission is paid to the person for the service." <!-- source-gap: referral-fee-rules | missing | state rules limiting payments to unlicensed referrers (flat fee versus contingent on sale, dollar caps) | closes with: state statutes or DOI bulletins on unlicensed referral fees, opened per state | checked: 2026-11-10 --> States differ on whether a referral payment may depend on the customer buying; I haven't compiled those rules, so my default is a flat fee per qualified referral that doesn't depend on a sale.

**4. The product isn't insurance.** A manufacturer's warranty, a retailer's service contract, a lender's GAP waiver or debt cancellation contract, and a merchant's own promise to reship a lost package are not insurance in most states when structured as the law allows, and selling them needs no producer license (the NAIC Service Contracts Model Act exempts sellers of compliant service contracts from licensing, Section 3E). Each has its own regime: [Service Contracts & Warranties](/books/insurance/service-contracts), [Vehicle Service Contracts & GAP](/books/insurance/vehicle-service-contracts-and-gap). The risk in this model is recharacterization: a regulator deciding that a "protection program" transfers risk for a fee and is insurance in substance, as UGP's chapter records for peer-to-peer car sharing in New York and Washington.

My default for a new program: decide the legal form first, per product and per state, and record it. Licensing, filing, tax, disclosures, refunds and who may be paid all follow from that one field.

## What a Partner May Say

In models 2 and 3, the partner's employees and pages are not licensed producers, and the law scripts what they may do. Florida's travel rules are representative: unlicensed retailer staff may not "evaluate or interpret" technical terms, advise a customer on whether existing coverage is adequate, or hold themselves out as licensed. Portable electronics sales by unlicensed employees require supervision and training by the insurer or a general lines agent. The NAIC travel model has the same shape, described in [Travel Insurance](/books/insurance/pet-and-travel#travel-insurance).

For the system, that turns into content rules:

- **Partner-facing copy comes from the insurer or licensed agency, versioned.** The offer title, the benefit summary, the price and the link to the full terms are rendered from approved content; the partner can't edit them. A page that paraphrases coverage is the partner negotiating.
- **Questions route to licensed people.** A "What does this cover?" chat or phone path goes to the licensed agency's staff, not the partner's support team, and the partner's support scripts say so.
- **Training is a record.** Where a limited license requires employee training (rental counters, retail stores, travel retailers), the training completion per employee and location is data the program checks, not a binder on a shelf.
- **Locations are registered.** Rental and retail licenses attach to locations; a store that opens must be added before it sells (Florida's rental car rule), so offers are gated on the location's status.

## Opt-In, Disclosure and Price Presentation

Embedded offers are where insurance law meets checkout law, and the strictest rule usually wins.

**Opt-in, not opt-out.** The NAIC Travel Insurance Model Act bans selling travel insurance or travel protection plans by "negative option or opt out," meaning any design that makes the consumer take an affirmative action to deselect coverage, such as unchecking a box on an electronic form, when buying a trip (Section 7D). The rule is written for travel, but the general consumer protection law reaches every pre-checked add-on. In *Demarco v. DNVB, Inc.* (S.D.N.Y.), a merchant automatically added a $2.98 "Shipping Protection" fee that customers had to uncheck, and told those who removed it that the company was "not responsible for damaged, lost, or stolen items during shipping," while its carrier already reimbursed lost or damaged packages up to $100. The court let the New York General Business Law 349 and 350 deception claims proceed, mainly because of the omitted carrier coverage, and dismissed the contract, implied covenant, unjust enrichment and injunctive claims (DLA Piper's summary, February 9, 2026). The conspicuous display of the fee in the cart didn't defeat the deception claims. Commerce covers the general rules in [Dark Patterns](/books/commerce/online-consumer-protection#dark-patterns) and carrier liability limits in [Carrier Liability and Claims](/books/commerce/shipping-and-carriers#carrier-liability-and-claims).

**Tell the buyer what they may already have.** Florida requires rental counters to give written notice that the renter's own policy may already cover the risk and that buying isn't required, storage lessors to say a homeowners policy may already cover stored goods, and portable electronics brochures to address duplication of coverage. Shipping protection is the same problem without a statute: the merchant or carrier may already owe the loss, and *Demarco* turned on not saying so.

**Optional means optional.** A lender, seller or manufacturer may not require a service contract as a condition of a loan or a sale (NAIC #685 Section 6C), Florida's travel brochures must say travel insurance is not required, and the travel model lets a seller make coverage a condition of the trip only where the destination jurisdiction requires it, and then only as a choice between buying it from the seller and proving the traveler's own coverage before departure (Section 7F). A coverage requirement (a lease requiring renters insurance, a lender requiring physical damage coverage) is lawful only when the customer may satisfy it with any qualifying policy, which is Property Tech's rule as well.

**Price presentation.** Under the FTC's Rule on Unfair or Deceptive Fees, the "total price" a covered business must show "more prominently than any other pricing information" may exclude "fees or charges for any optional ancillary good or service" (16 CFR 464.1, 464.2), so a genuinely optional protection plan stays out of the headline price but its price must be clear when selected. Which businesses the rule covers, and state junk fee laws, are in Commerce's [Fees and Drip Pricing](/books/commerce/online-consumer-protection#fees-and-drip-pricing). An add-on that the buyer can't remove is a mandatory fee and belongs in the total.

**Insurance disclosures still apply.** The policy or certificate, the insurer's name, the claims process, the cancellation and refund terms, and any state-specific notices are delivered as they would be for any policy, with e-delivery consent where the state requires it ([Electronic Delivery](/books/insurance/quote-bind-and-issue#electronic-delivery)).

## The Money: Premium, Compensation and Revenue Share

An embedded sale moves the customer's money through the partner's payment flow, and three things happen to it: premium goes to the insurer (net of what the insurer lets the seller keep), compensation goes to whoever is lawfully allowed to receive it, and tax is owed on the insurance part only.

**Premium is the insurer's money from the moment it's collected.** Florida's portable electronics rule says it outright: premiums collected are held in trust for the insurer and remitted within 60 days. In agency terms this is fiduciary money ([Trust Accounts and Fiduciary Funds](/books/insurance/commissions-and-agency-accounting#trust-accounts-and-fiduciary-funds)), and the partner's revenue system must not book the gross as its own revenue.

**Compensation takes the form the license allows.**

| Partner's model | What it may receive | Booked as |
| --- | --- | --- |
| Licensed agency | Commission on premium, contingent commission | Commission income, with clawbacks on cancellation |
| Limited lines licensee | Commission to the licensed entity; unlicensed employees not paid per sale (Florida portable electronics) | Commission income at the entity |
| Referrer that doesn't sell | A payment for referrals under #218 Section 13D, subject to state anti-rebating law | Marketing or referral revenue, not commission |
| Seller of a non-insurance product | The product's margin (service contract retail price less the obligor's cost) | Revenue from its own product, under its own accounting |

**A partner may also share in results.** Assurant's 10-K describes "client profit sharing adjustments" and up-front commission payments to clients "typically supported by various protections, such as letters of credit, letters of guarantee and real estate." When the partner shares underwriting results, the arrangement is closer to reinsurance or a profit commission and needs to be designed as one (Boost Re is a productized version: the partner provides its own risk capacity, as described in [Capacity Providers and Collateral](/books/insurance/mgas-programs-and-fronting#capacity-providers-and-collateral)).

### Worked Numbers: A Device Policy Sold at Checkout

My numbers. A retailer with a limited lines license sells a one-year portable electronics policy on a $1,000 phone for $96.00, effective at delivery on March 1. The retailer's commission is 20% under its agency contract. The customer cancels after 73 days.

| Step | Calculation | Amount |
| --- | --- | --- |
| Written premium | Filed rate | $96.00 |
| Retailer commission | $96.00 × 20% | $19.20 |
| Remitted to the insurer (net of commission), within 60 days | $96.00 − $19.20 | $76.80 |
| Earned at cancellation, pro rata daily | $96.00 × 73 / 365 | $19.20 |
| Unearned, refunded to the customer | $96.00 × 292 / 365 | $76.80 |
| Commission returned by the retailer | $19.20 × 292 / 365 | $15.36 |
| Insurer's net refund cost | $76.80 refund − $15.36 commission returned | $61.44 |

Two design points sit in the table. The refund runs through the partner's payment system (the customer paid the retailer) but is the insurer's obligation, so the program needs a refund path with a deadline and a reconciliation between the partner's refund and the insurer's return premium transaction. And the commission clawback is computed with the same earning rule as the premium, from the same transaction ([Return Premium: Pro Rata and Short Rate](/books/insurance/cancellation-and-nonrenewal#return-premium-pro-rata-and-short-rate)); a partner whose revenue system recognized the $19.20 at sale has to reverse $15.36 of it.

**Attach rate is the program's demand curve.** Vendors sell on it (Cover Genius cites a "5x increase in insurance attach rates" for one shipping partner; bolttech cites conversion increases), and partners tune it with placement and defaults. Opt-in law caps the lever that moves it most, which is why my rule is to test copy and placement, never the default state.

## The API Shape

Every vendor in the survey exposes the same sequence, whatever it calls the calls. Extend's public reference is the clearest: a **Get Offer** call that "returns warranty plans and pricing for a specific product"; an **order** create or update call (orders "should represent the complete order"); a **line item fulfill** call on which, "if applicable creation of associated contracts is triggered"; contract search, get and update; a refund report; and claim status and service order webhooks. Cover Genius describes a RESTful API returning "pricing and product recommendations in real time" through "a single API call" with end-to-end claims; bolttech an "Embedded API" with quote, bind and pay. Mapped to the core model:

| Step | Partner does | Insurer or platform does | Core record |
| --- | --- | --- | --- |
| **Offer** | Sends cart context: product, price, location, customer state, trip or rental dates | Checks the partner's license basis and the product's filing for that state, rates, returns offer IDs with prices and versioned content | `quotes`, one per offer |
| **Present** | Renders the offer, unselected, with the approved content and disclosure links | Nothing, until told | `offer_presentations` (this chapter) |
| **Select** | Records the customer's affirmative selection | Nothing yet | `offer_presentations.selected_at` |
| **Bind** | Calls bind after payment is authorized or captured, with an idempotency key | Binds and issues; for delayed coverage (from delivery, from trip start) the effective date is set or set later | `policies`, `policy_transactions` (new_business) |
| **Fulfill** | Reports delivery, shipment or trip start | Starts coverage, sends documents, starts free-look and refund windows | `documents`, effective date on the transaction |
| **Change or cancel** | Reports returns, order cancellation, customer cancellation | Cancellation transaction, return premium, commission reversal | `policy_transactions` (cancellation), `premium_entries`, `commissions` |
| **Remit and reconcile** | Remits collected premium net of compensation | Matches remittance to transactions, chases shortfalls | `payments`, a partner statement |
| **Claim** | Usually nothing; the customer claims with the insurer or administrator | FNOL, decision, payment; status webhooks back to the partner | `claims`, `exposures` |

The design problems are the ones any checkout integration has, with insurance consequences:

- **The offer is tied to the cart and expires.** A quote is priced on the cart's facts (item price, destination, dates); if the cart changes, the offer is reissued. The bind call carries the offer ID and is rejected if the offer expired or the facts changed.
- **Bind exactly once.** Checkout retries are normal; a duplicate bind is a duplicate policy and a duplicate premium charge. The bind call carries the partner's order line ID as an idempotency key ([Idempotency](/docs/requests/idempotency)).
- **Payment and coverage are separate facts.** The customer's card is charged by the partner; the insurer's premium is owed by the partner. A policy bound on an authorization that later fails must be cancelled flat, and the partner's remittance must show it.
- **Partial returns.** An order of three items with one protected and later returned cancels one certificate, not the order's coverage; Extend's line-item cancel and the per-line contracts are the right grain.
- **Coverage that starts later.** Product protection usually runs from delivery (and often after the manufacturer's warranty for breakdown), travel from departure, shipping protection from shipment. The bound transaction records the start rule; the fulfillment event sets the date.

The gate that decides whether an offer may be shown at all is the one piece of logic every program needs and few write down. Mine:

```go tab="Go"
type OfferContext struct {
	State          string // where the customer or risk is
	PartnerBasis   string // "agency", "limited_lines", "referral", "not_insurance"
	LicensedHere   bool   // partner license (or registration) active in State on the date
	ProductFiled   bool   // product approved or exempt in State on the date
	LocationActive bool   // rental or retail location registered, where required
	DefaultChecked bool   // what the partner's UI will render
}

// MayPresent returns an empty reason when the offer may be shown.
func MayPresent(c OfferContext) string {
	switch {
	case c.DefaultChecked:
		return "offer must render unselected"
	case !c.ProductFiled:
		return "product not available in " + c.State
	case c.PartnerBasis != "not_insurance" && c.PartnerBasis != "referral" && !c.LicensedHere:
		return "partner not licensed in " + c.State
	case c.PartnerBasis == "limited_lines" && !c.LocationActive:
		return "location not registered"
	}
	return ""
}
```

```rust tab="Rust"
pub struct OfferContext<'a> {
    pub state: &'a str,          // where the customer or risk is
    pub partner_basis: &'a str,  // "agency", "limited_lines", "referral", "not_insurance"
    pub licensed_here: bool,     // partner license (or registration) active on the date
    pub product_filed: bool,     // product approved or exempt in the state on the date
    pub location_active: bool,   // rental or retail location registered, where required
    pub default_checked: bool,   // what the partner's UI will render
}

/// Returns None when the offer may be shown, or the reason it may not.
pub fn may_present(c: &OfferContext) -> Option<String> {
    if c.default_checked {
        return Some("offer must render unselected".into());
    }
    if !c.product_filed {
        return Some(format!("product not available in {}", c.state));
    }
    let needs_license = !matches!(c.partner_basis, "not_insurance" | "referral");
    if needs_license && !c.licensed_here {
        return Some(format!("partner not licensed in {}", c.state));
    }
    if c.partner_basis == "limited_lines" && !c.location_active {
        return Some("location not registered".into());
    }
    None
}
```

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). An embedded partner is a party; if it's licensed, it's also a `producers` row with `producer_licenses` (an agency or a limited lines entity, Producer Licensing & Appointments) and `appointments`; its channel is `embedded` in `channels` (Agents, Brokers & Channels); its compensation is `commissions` rows (Commissions & Agency Accounting); a travel retailer is also a `travel_retailer_registrations` row under its limited lines travel producer (Pet & Travel Insurance). Each offer is a `quotes` row. This chapter adds the partner agreement and the presentation record:

```sql
CREATE TABLE distribution_partners (       -- a business that offers coverage in its own flow
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  producer_id        UUID REFERENCES producers (id),   -- null when it doesn't sell
  basis              TEXT NOT NULL CHECK (basis IN ('agency', 'limited_lines', 'referral',
                       'not_insurance')),
  program_id         UUID REFERENCES programs (id),    -- when an MGA runs the program
  compensation       TEXT NOT NULL CHECK (compensation IN ('commission', 'referral_fee',
                       'product_margin', 'profit_share', 'none')),
  remit_days         INT,                   -- FL portable electronics: 60
  agreement_ref      TEXT NOT NULL,         -- the signed agreement, versioned
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE partner_offerings (           -- what a partner may offer, where, from when
  partner_id         UUID NOT NULL REFERENCES distribution_partners (id),
  product_id         UUID NOT NULL REFERENCES products (id),
  state              TEXT NOT NULL,
  legal_form         TEXT NOT NULL CHECK (legal_form IN ('insurance', 'service_contract',
                       'home_warranty', 'vsc', 'debt_cancellation',  -- policies.legal_form
                       'merchant_guarantee')),  -- the merchant's own promise, no policies row
  content_version    TEXT NOT NULL,         -- approved offer copy and disclosure set
  requires_location  BOOLEAN NOT NULL DEFAULT FALSE,
  valid_during       DATERANGE NOT NULL,
  PRIMARY KEY (partner_id, product_id, state, valid_during)
);

CREATE TABLE partner_locations (           -- rental counters and stores under a license
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_id         UUID NOT NULL REFERENCES distribution_partners (id),
  state              TEXT NOT NULL,
  address            JSONB NOT NULL,
  reported_at        TIMESTAMPTZ,           -- to the department, before sales begin
  active             DATERANGE NOT NULL
);

CREATE TABLE offer_presentations (         -- what the customer saw and chose
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_id         UUID NOT NULL REFERENCES distribution_partners (id),
  quote_id           UUID NOT NULL REFERENCES quotes (id),
  partner_order_ref  TEXT NOT NULL,         -- the order line, the bind idempotency key
  location_id        UUID REFERENCES partner_locations (id),
  content_version    TEXT NOT NULL,         -- the copy and disclosures as rendered
  disclosure_doc_ids UUID[] NOT NULL,       -- documents shown or linked
  default_state      TEXT NOT NULL CHECK (default_state = 'unselected'),
  presented_at       TIMESTAMPTZ NOT NULL,
  selected_at        TIMESTAMPTZ,           -- an affirmative act, or null
  declined_at        TIMESTAMPTZ,
  policy_id          UUID REFERENCES policies (id),  -- set at bind
  UNIQUE (partner_id, partner_order_ref, quote_id)
);
```

The `CHECK (default_state = 'unselected')` is deliberate: the database refuses to record a pre-checked offer, so a partner integration that tries one fails loudly in testing. Design choices that matter:

- **Legal form per product and state** in `partner_offerings`, with the same values as `policies.legal_form` ([Service Contracts & Warranties](/books/insurance/service-contracts#how-to-build-it)) plus `merchant_guarantee`, because the same partner may sell an insured device plan in one state and a service contract in another; licensing, tax and refunds read this field.
- **The offer gate reads data, not code branches:** the partner's basis and license, the product's state availability, the location's registration and the content version are all dated rows.
- **Presentation is evidence.** The rendered content version, the disclosures, the default state and the selection time are kept for every offer, sold or not, because the attach rate and the opt-in proof come from the same rows.
- **Remittance is reconciled per transaction.** A partner statement nets premium collected, compensation retained and refunds paid against the insurer's transactions; any difference is an exception with an owner, the way a bordereau is ([The Bordereau](/books/insurance/mgas-programs-and-fronting#the-bordereau)).

## Auditing

- **Every sale traces to a license basis.** For a sample of policies, the partner, its basis, its license or registration on the sale date, the location where required, and the appointment.
- **No unlicensed per-sale pay.** Compensation records show who was paid for each sale; unlicensed individuals received no commission (Florida portable electronics), and referral payments match the referral agreement.
- **Opt-in proof.** For a sample of sold and declined offers, the presentation record shows an unselected default and the customer's affirmative selection, with the content version shown.
- **Disclosures given.** The state's required notices (duplication of coverage, not required to buy, insurer identity, refund rights) were in the presented content version for the state.
- **Premium held and remitted on time.** Collected premium was remitted within the agreement's and the state's deadline; refunds paid by the partner tie to cancellation transactions.
- **Legal form consistent.** A product sold as a service contract in a state has no insurance premium tax and no producer commission; one sold as insurance does.

## What This Means for the System You Build

- **Decide and record the legal form first,** per product and state: insurance, service contract, debt cancellation or merchant guarantee.
- **Gate every offer on dated data:** the partner's license basis, the product's availability, the location's registration and the approved content version.
- **Render offers unselected,** store what was shown and what the customer chose, and keep declined offers too.
- **Treat collected premium as the insurer's money,** remitted on a deadline, with refunds and commission reversals computed from the same transaction.
- **Make bind idempotent on the partner's order line,** tie it to payment, and start coverage on the fulfillment event.
- **Route coverage questions to licensed people** and keep partner copy out of the partner's hands.

## References

**Law and regulation**

- [Fla. Stat. 626.321](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.321.html), Florida's limited licenses: travel, motor vehicle rental, credit, in-transit and storage property, portable electronics (unlicensed employee sales, no commissions, brochures, 60-day trust remittance), appointments and authorized insurers only
- [16 CFR 464.1](https://www.law.cornell.edu/cfr/text/16/464.1), the FTC fees rule's total price definition excluding optional ancillary goods or services
- [16 CFR 464.2](https://www.law.cornell.edu/cfr/text/16/464.2), total price shown more prominently than other pricing information and disclosure of excluded fees

**NAIC**

- [NAIC: Producer Licensing Model Act (#218) (PDF)](https://content.naic.org/sites/default/files/model-law-218.pdf), license required, the definitions of sell, solicit and negotiate, limited lines and limited line credit insurance, the Section 4 exemptions, and the Section 13 commission rules including 13D
- [NAIC: Service Contracts Model Act (#685) (PDF)](https://content.naic.org/sites/default/files/model-law-685.pdf), sellers of compliant service contracts exempt from licensing (Section 3E) and no service contract as a condition of a loan or sale (Section 6C)
- [NAIC: Travel Insurance Model Act (#632) (PDF)](https://content.naic.org/sites/default/files/model-law-632.pdf), the negative option ban

**Courts**

- [DLA Piper: Key considerations for automatic shipping protection fees, February 9, 2026](https://www.dlapiper.com/en/insights/publications/2026/02/key-considerations-for-automatic-shipping-protection-fees), *Demarco v. DNVB, Inc.* (S.D.N.Y.): the $2.98 auto-added fee, the omitted $100 carrier coverage, and which claims survived

**Filings**

- [Assurant: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1267238/000126723826000010/aiz-20251231.htm), B2B2C distribution, Global Lifestyle and Global Housing revenue, client agreement terms, up-front commission payments and client profit sharing
- [Allstate: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/899051/000089905126000031/all-20251231.htm), Protection Services' share of revenue and policies in force, Protection Plans' channels and Dealer Services products
- [Root: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000014/root-20251231.htm), the embedded product with Carvana

**Vendor documentation**

- [Extend: API reference](https://docs.extend.com/), offers, order upsert, line item fulfillment creating contracts, refunds, claims and webhooks
- [Cover Genius: XCover](https://www.covergenius.com/xcover/), licensing footprint, real-time pricing API, languages, currencies, partners and attach rate figures
- [bolttech](https://bolttech.io/), markets, partners, products, quoted premiums and the embedded quote, bind and pay API
- [Boost Insurance](https://boostinsurance.com/), white-label carrier paper, API policy administration, agency portal and Boost Re
