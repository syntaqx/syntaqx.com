+++
title = "Customer Self-Service"
description = "Portals and the contact center: sign-in, households and multi-site access, online booking, payments and autopay, history, cancellation and AI voice agents."
category = "Field Operations Industry"
order = 1529
part = "Customers and Billing"
tags = ["field-operations", "customer-portal", "contact-center", "authentication", "payments", "ai"]
+++

After the sale, a customer reaches a field service business through two doors: the portal (web or app) and the contact center (phone, text, email, and now an AI agent answering both). What they want is mostly small: when is my next visit, can it be Thursday, what do I owe, change my card, send me last year's termite report, approve the quote for the new water heater, show me the backflow test certificate the city wants. Each one handled without a person is a call nobody had to answer, which matters in a business where the office is often a handful of people. The catch is that a self-service portal is not a simpler product with simpler rules. A customer moving their own visit has to obey the same capacity, routing and policy rules as a dispatcher; a customer saving a card brings the platform into PCI scope; a household has several people with different rights; and a commercial client wants forty sites under one login, an auditor who can only read, and proof that last month's work orders met the response times in its contract. The portal has to say no as clearly as a person would, and leave the same record a person would.

## What Customers Come to Do

Across the vendors below, the portal's jobs are consistent: **see what's coming** (next visits, windows, the technician), **change it** (request, book, reschedule, cancel), **pay** (invoices, autopay, saved methods, financing), **look back** (history, reports, photos, products applied), **sign and keep documents** (quotes, agreements, warranties, certificates) and **manage the account** (contacts, people with access, preferences, properties). The contact center does the same jobs by voice or text, and increasingly an AI agent does them first. Both doors should call the same underlying operations, so what a customer can do doesn't depend on which door they used.

## How the Platforms Do It

The SMB and vertical suites all ship a portal; they differ in sign-in, scheduling power, and how much commercial structure they model.

| Platform | Sign-in | Scheduling | Payments | Notable |
| --- | --- | --- | --- | --- |
| FieldRoutes | Portal account | Upcoming dates for active subscriptions | Pay balances, opt into AutoPay, default method in Wallet; renewals with Pay Now, no partials | Products-used tab; rate the technician; master account across properties |
| GorillaDesk | Permanent unique portal URL | Not published | Manage payment options, pay invoices | Documents area; optional contact form |
| Housecall Pro | Magic link valid 7 days | Book Online; message to request new, rescheduled or cancelled visits | Pay invoices; card on file | Approve estimates; statement summary |
| Jobber client hub | Magic link; re-verify after 14 days without one | Submit requests; next five upcoming visits | Pay invoices with tips and partial payments if enabled; pay deposits; Wallet | Approve quotes or request changes, with optional line items |
| PestPac | Not published | Appointment requests | Online payment, stored methods | Commercial dashboards, trend reports, pest sightings, audit-only users |
| ServiceTitan | Customer requests an invitation with the email on their record | Appointment requests when the web scheduler is on; staff book them | Pay one invoice partially or several in full; update the membership card; Affirm financing | History per service location; Memberships tab shows upcoming maintenance |

PestPac's row comes from its marketing pages; the rest from each vendor's help center (see References).

A few patterns stand out. **Request versus book:** ServiceTitan's and PestPac's portals let customers request appointments that staff then confirm, while Housecall Pro and Jobber also offer true online booking against live availability. **Commercial depth:** PestPac's commercial portal manages multiple locations and creates audit-only users for specific sites, and ServiceTrade's service portal shows quotes with photos and an approve button, deficiencies, asset details and service history, with the company choosing which job media each customer sees. That's the commercial mechanical trades' version of self-service: a facilities manager approving a deficiency repair on a rooftop unit from a photo, without a site visit. **The report as the product:** pool platforms make the visit report the main self-service surface; Skimmer emails service reports with photos and offers a portal so customers can pay without calling the office, and Pool Brain lets customers view past route stop details on demand.

## Signing In

Field service customers log in a few times a year, usually from a link in a text or email. Passwords fail that pattern: forgotten every time, reset every time. The SMB suites moved to **magic links**, a one-time URL sent to an address already on the customer record: Jobber's client hub may ask clients to re-verify with an email or phone digits, and Housecall Pro's links are valid for 7 days. ServiceTitan instead has customers request an invitation using the email on their customer record, which ties the login to a known contact rather than letting anyone self-register against an account.

Against NIST SP 800-63B, which says email "SHALL NOT be used for out-of-band authentication" and treats SMS as a restricted authenticator, a seven-day emailed link is a convenience-first choice: fine for viewing the next visit, weak for changing where the money comes from. So **tier the actions.** Viewing schedules, history and invoices, and paying a specific invoice, can ride on a link-based session; adding or removing people, changing the autopay method, changing the email or phone that receives links, and cancelling a plan require a fresh verification. Offer passkeys to the customers who come back often (property managers, commercial accounts), and **bind sign-in to a contact already on the account:** an unknown email gets "ask the business to add you," not a new empty account. Sessions, codes and recovery in general are in [Authentication](/docs/security/authentication).

## Households and Commercial Sites

A customer account is not a person. A home has an owner and a spouse who pays the bills; a rental has a landlord who pays and a tenant who lets the technician in; a property manager has dozens of buildings; a restaurant chain has a regional manager, a store manager per site, and a food-safety auditor who must see every inspection report and change nothing.

The vendors model pieces of this. ServiceTitan separates the customer (who pays) from locations (where service happens), and its portal shows history per location. FieldRoutes lets a master account switch between properties to see each balance. Housecall Pro offers sub-customers in a parent-child relationship for when you communicate with one party and invoice another, such as property managers and tenants. PestPac's audit-only users are the read-only role made explicit. The full account and property model is in [Customers, Accounts & Properties](/books/field-operations/customers-and-properties).

![Portal access model: four people (account owner, spouse, tenant, site auditor) each hold a grant with a role and a scope (admin on all properties, billing on all, booking on property B, read-only on site 14) that points into one bill-to account and its properties.](/diagrams/fo-customer-self-service-access.svg "Logins belong to people. What each person can do is a separate grant row, scoped to the whole account or to one property, and revocable on its own.")

The sketch adds two tables to the canonical `people`, `accounts` and `properties` from [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model), without redefining those:

```sql
CREATE TABLE portal_users (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  person_id      UUID NOT NULL REFERENCES people (id),
  status         TEXT NOT NULL CHECK (status IN ('invited', 'active', 'disabled')),
  last_login_at  TIMESTAMPTZ
);

CREATE TABLE portal_grants (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  portal_user_id  UUID NOT NULL REFERENCES portal_users (id),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  property_id     UUID REFERENCES properties (id),  -- null: every property on the account
  role            TEXT NOT NULL,                   -- 'admin', 'billing', 'scheduling', 'read_only'
  granted_by      UUID NOT NULL,                   -- an admin portal user or a staff member
  granted_at      TIMESTAMPTZ NOT NULL,
  revoked_by      UUID,                            -- the actor type is on the audit entry
  revoked_at      TIMESTAMPTZ
);
```

Contact points (the email and phone a link is sent to) belong to the person, not the login, so a changed phone number is one update everywhere.

Rules that keep this sane: only an admin grant can create grants, and never above its own scope. Billing rights see invoices and payment methods but not necessarily the service details at a site. A tenant with booking rights on one property must not see the landlord's other properties or the account balance. Read-only is a role, not an absence of buttons: enforce it on the server ([Authorization](/docs/security/authorization)). And removing a person (a divorce, a tenant moving out, a fired store manager) is one action that revokes every grant and every active session at once.

## Booking and Rescheduling Online

Online booking for new work, including each vendor's booking settings (earliest availability, buffers, drive-time limits, request fallbacks), lives in [Booking Appointments](/books/field-operations/booking-appointments); the portal's version is mostly rescheduling existing visits, and it should honor those same settings.

Recurring route-based work (pest, lawn, pool) is harder to reschedule than one-off trades work, because the visit belongs to a route on a day in an area. Moving a quarterly pest visit from Tuesday to Thursday is only cheap if a technician is already in that neighborhood on Thursday, so the portal should offer reschedule windows ranked by what they add to a route, as [Booking Appointments](/books/field-operations/booking-appointments#offer-times-where-the-routes-already-are) describes for new bookings.

![Reschedule flow from the portal: the customer asks, a policy check can send it to the office, a slot search can show the next open dates, a held slot can expire and send the customer back to search, and the commit emits an event, notifies and audits.](/diagrams/fo-customer-self-service-reschedule.svg "The portal calls the same scheduling service as the dispatcher. It never writes the visit row itself, so every rule applies to both.")

The pieces:

1. **Policy check** before showing anything: is the visit inside a cutoff (commonly the day before, since the route is built); is it locked by dispatch; is the account past due beyond a threshold; does the service type allow customer changes (a fumigation with tenting and permits should not, nor a furnace replacement with a crane booked, nor a commercial kitchen hood cleaning scheduled around the restaurant's closed hours); has the customer reached the reschedule limit the business configured. A failed check routes to "send a request to the office" with the reason, not a dead end.
2. **Slot search** from the same capacity and routing engine the office uses ([Territories & Capacity](/books/field-operations/territories-and-capacity)), restricted to days a route serves that area, and showing arrival windows, not exact times.
3. **Hold** the chosen slot briefly (a visit in the `held` state with an expiry is one way), because two customers can pick the last opening at once. A hold that expires sends the customer back to search.
4. **Commit** through the scheduling service, which moves the visit to its new time and publishes the change; notifications follow from that event ([Customer Communications](/books/field-operations/customer-communications)), not from the portal.

How the hold becomes the moved visit, using the `held` visit row from [Booking Appointments](/books/field-operations/booking-appointments#requests-and-holds): the hold is a placeholder row that carries the new slot (date, arrival window, resource) and an expiry, and records which visit it would replace. On commit, one transaction checks the hold hasn't expired, copies its slot onto the original visit (guarded by the visit's `row_version`, so a dispatcher's edit in the meantime fails the commit instead of being overwritten), and ends the placeholder as `cancelled` with status reason `expired` so it stops occupying the slot. The customer's visit keeps its ID, its work order and occurrence links, its history and its notification thread; only its time changed. A hold that lapses before commit ends the same way, and the original visit never moved.

A visit inside the cutoff can still be cancelled or skipped online, with a request to rebook. Recurring plans have one more case: when a customer moves one visit, the next occurrence's window may or may not move with it, depending on how the recurrence computes it ([Recurring Schedules](/books/field-operations/recurring-schedules)). Show the effect before confirming.

## Paying, Autopay and Saved Methods

Paying is the most-used portal feature, and the vendors converge on it: open invoices, partial payments where enabled, tips (Jobber), a wallet of saved methods, and autopay enrollment. Financing appears at the payment step for replacements and installs (ServiceTitan adds Affirm to its customer portal, Housecall Pro offers Klarna on residential invoices), presented under the rules in [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules#financing-presentment).

Three design rules:

- **Card data never touches your servers.** Use the processor's hosted fields or hosted page, which keeps the portal on SAQ A under the conditions in [PCI DSS](/docs/compliance/pci-dss#payment-page-scripts). The field twist is that customers reach the portal from a text or email link to one invoice, so that invoice page is a payment page: keep marketing tags and chat widgets off it, or redirect to the processor to pay.
- **Saving a method for autopay is a stored-credential agreement.** Show the terms (amount or how it is determined, frequency, how to cancel), record consent with the method, and flag the first charge correctly ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)). Bank accounts need an ACH authorization the customer can keep a copy of ([ACH](/books/payments/ach)).
- **Show the real balance and what autopay will do.** FieldRoutes' renewal Pay Now takes no partial payments; Jobber charges automatic payments once and notifies the business on failure rather than retrying. Whatever your rules are, the portal should state them where the customer decides. Billing logic itself is in [Billing Recurring Service](/books/field-operations/billing-recurring-service).

## History, Reports and Documents

For recurring service the history is the value the customer is paying for and cannot see: the technician came while they were at work. FieldRoutes' portal shows each serviced appointment with technician, notes, invoice, products used and cost, plus a product usage tab; Skimmer emails each pool visit's report with photos. For pest and lawn this doubles as the customer's copy of an application record, and commercial clients use it in their own audits (PestPac markets inspection and trend reports and open conditions for commercial accounts). Other trades have their own documents customers come back for: the backflow test report a water utility asks for, the refrigerant and equipment readings from an HVAC maintenance visit, the cleaning checklist a property manager uses at move-out, the delivery's proof of signature. Commercial service agreements add one more: whether each work order met the contracted response and completion times, which the client will otherwise rebuild from its own records.

Decide what is customer-visible per field, not per record. A visit has internal notes ("dog bit last tech"), a customer-facing summary, photos some of which show neighbors or the inside of a home, and findings. ServiceTrade's choice of which job media each customer sees is the right granularity. Documents (agreements, signed quotes, warranties, WDO reports) should be the exact signed artifact, immutable, with the signature evidence behind it ([Signing the Agreement](/books/field-operations/signing-the-agreement)), not a re-rendered copy from current data.

## Cancelling and Changing the Plan

Online cancellation is where self-service meets automatic renewal law. The general design (cancel in the medium of sign-up, stamp the receipt time, store the effective date, confirm it, save offers as configuration that one click declines) and the law behind it are in [Subscriptions](/docs/payments/subscriptions#cancellation); the field rules are in [Consumer Protection](/books/field-operations/consumer-protection).

The field mechanics (any channel, the route cleared in the same transaction, the final bill, obligations that outlive the agreement) are in [Collections & Retention](/books/field-operations/collections-and-retention#cancellations). The portal's own choice is whether its cancel button **requests** or **cancels**. A request (FieldRoutes' online cancellation, enabled per service type, creates a task for staff) keeps a person in the loop for saves and exceptions, at the cost of a visit that shows up after the customer cancelled if nobody acts in time; the customer's clock starts when they asked either way. My rule: the portal cancels, recording the receipt time and an effective date the customer can see and clearing future visits, and leaves staff only the exceptions (a prepaid balance, a termite warranty with a renewal inspection due, a final pool closing the customer asked to keep). Show any early termination fee from the agreement version the customer signed.

Plan changes from the portal (adding mosquito service for the summer, moving a pool from weekly to biweekly in winter, upgrading an HVAC membership) are a new agreement version, not an edit, and change the recurrence that generates visits as well as the price; proration is in [Subscriptions](/docs/payments/subscriptions#plan-changes-and-proration).

## Staff View as Customer

Two different things get called "acting as the customer," and they need different machinery.

**Everyday office work is normal staff permission.** A customer service rep who reschedules a visit, takes a payment or adds a tenant while the customer is on the phone is doing their job in the office app, with their own role's permissions. They call the same domain operations the portal calls, as themselves, and the audit entry records the staff member as the actor, the account and property as the subject, and the channel (`phone`, `text`, `email`) the customer asked through. No session as the customer is involved, and none is needed.

**Seeing the portal as the customer is a support session.** To answer "where is the button" or reproduce a bug, support staff need the customer's view. That's delegation, not impersonation: a time-limited session that records both the staff member and the customer, starts read-only, shows a banner, needs a reason, and never touches the customer's sign-in factors. It's rare, and its design is in [Support Access](/docs/security/support-access).

The mistake to avoid is routing everyday work through support sessions (thousands a week, so nobody reviews them) or letting support sessions write by default.

## The Contact Center and AI Voice Agents

The other self-service door is the phone, answered by CSRs and increasingly by AI voice agents. Routing, the CSR's screen, recording and booking credit are in [The Contact Center](/books/field-operations/contact-center); which AI products ship what, and the field caps on what an agent may book, are in [AI in Field Operations](/books/field-operations/ai-in-field-operations). The design point is the one this chapter keeps making: **the CSR and the agent are other clients of the same operations,** calling the same reschedule policy check, slot search and payment-link flow the portal does, so a rule changed once applies everywhere.

## How to Build It

Treat the portal and the agent as thin clients over domain services, with their own authorization layer:

```json
{
  "actor": { "type": "portal_user", "id": "0193e1a2-4c5d-7e6f-8a9b-0c1d2e3f4a51", "on_behalf_of": null },
  "subject": {
    "account_id": "0193e1a2-4c5d-7e6f-8a9b-0c1d2e3f4a52",
    "property_id": "0193e1a2-4c5d-7e6f-8a9b-0c1d2e3f4a53"
  },
  "action": "visit.reschedule",
  "request": {
    "visit_id": "0193e1a2-4c5d-7e6f-8a9b-0c1d2e3f4a54",
    "hold_id": "0193e1a2-4c5d-7e6f-8a9b-0c1d2e3f4a55"
  },
  "idempotency_key": "0193e1a2-4c5d-7e6f-8a9b-0c1d2e3f4a54:reschedule:3"
}
```

- **Every portal action resolves a grant** (user, account, property, role) before calling a domain service, and passes the actor through so the service's audit records who did it.
- **Portal reads come from customer-facing projections:** upcoming visits, the customer-visible visit summary, open invoices. They are filtered at build time, so an internal note cannot leak through a forgotten serializer.
- **Idempotency on every write** ([Idempotency](/docs/payments/idempotency)): customers double-tap pay buttons on bad connections.
- **Configuration per tenant and service type:** which actions are self-service, reschedule cutoffs, booking horizon, partial payments and tips, which documents and photos are visible, financing.
- **Accessible.** The audience includes older homeowners on phones ([Accessibility](/docs/frontend/accessibility)).

Build or buy: a billing portal (Stripe's customer portal, or your processor's) covers payment methods and invoices well, but scheduling, history, reports and grants are domain-specific, so most platforms build the portal and embed the processor's hosted fields. What is genuinely hard is consistency: the portal showing a visit that dispatch moved five minutes ago, a payment shown as pending for days on ACH ([Payment States](/docs/payments/payment-states)), and two doors (portal and agent) drifting into different rules.

## Auditing

Self-service shifts actions from staff to customers and agents, so the record has to say which. When a customer disputes a charge ("I cancelled online in March"), a tenant claims the landlord never authorized a visit, or a commercial client's auditor asks who changed a site contact, the answer is in the log. The general design (typed actors, delegated sessions, access logging) is in [Audit Trails](/docs/architecture/audit-trails), and field records are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records). For the portal specifically, make sure the record shows:

- **The channel and the grant behind every action:** portal, AI agent, staff in the office app, or a support session, and which person's grant on which property allowed it, so "the tenant moved the visit" is provable.
- **The cancellation request's receipt time,** the effective date shown, any fee shown and the visits it removed from the schedule.
- **Which disclosures were shown at acceptance:** autopay terms, ACH authorization text and financing disclosures, by version.
- **Who viewed or downloaded reports and certificates,** especially commercial auditors and anyone with a read-only grant ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **One set of domain operations** behind portal, contact center and AI agent, with the portal never writing visits, payments or agreements directly.
- **Link or code sign-in for low-risk actions** and fresh verification for changing people, contact points, payment methods and plans, with passkeys for frequent users.
- **People separate from accounts,** with grants scoped by role and property, enforced server-side, and revocable in one step.
- **Reschedule through policy check, slot search, hold and commit,** where commit moves the original visit into the held slot, with a request-to-office fallback that carries the reason.
- **Hosted payment fields,** SAQ A eligibility confirmed with the provider, and stored-credential and ACH consent recorded with each saved method.
- **Field-level visibility** for history, photos and notes, and immutable signed documents.
- **A deliberate request-or-cancel choice** for the portal's cancel button, with the receipt time, effective date and fees from the signed agreement version.
- **Staff acting for a customer use their own permissions,** logged with the channel; delegated support sessions per [Support Access](/docs/security/support-access) only for seeing the customer's view.
- **AI agents calling the same operations** under their own identity, with disclosure per [AI in Field Operations](/books/field-operations/ai-in-field-operations#the-law).
- **Customer-facing documents by trade:** application records, backflow and inspection certificates, equipment readings, and SLA compliance for commercial accounts.

## References

**Specifications**

- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html), email excluded as an out-of-band authenticator, the phone network as restricted, the 10-minute single-use code, 100 failed attempts and 30-day reauthentication at the lowest level

**Reference**

- [FIDO Alliance: passkeys](https://fidoalliance.org/passkeys/), passkeys as phishing-resistant FIDO2 credentials, synced or device-bound
- [Stripe: customer portal](https://docs.stripe.com/customer-management), a generic billing portal: payment methods, invoices and cancellation

**In practice**

- [ServiceTitan: customer portal overview](https://help.servicetitan.com/docs/customer-portal-overview.md), invitations, invoice payment, memberships and appointment requests
- [ServiceTitan: Affirm in the customer portal](https://help.servicetitan.com/release-hub/docs/offer-affirm-financing-in-the-customer-portal-to-help-homeowners-pay-for-jobs), portal financing
- [FieldRoutes: navigating the customer portal](https://knowledgebase.fieldroutes.com/docs/navigating-the-customer-portal.md), tabs, AutoPay, history with products used, and multi-property access
- [FieldRoutes: Online Service Cancellation](https://knowledgebase.fieldroutes.com/docs/online-service-cancellation.md), portal cancellation requests that create staff tasks, enabled per service type
- [Jobber: what clients see in client hub](https://help.getjobber.com/en/articles/what-do-your-clients-see-in-client-hub/), magic links, requests, quotes, payments and Wallet
- [Jobber: automatic payments](https://help.getjobber.com/en/articles/automatic-payments/), single-attempt autopay and failure handling
- [Housecall Pro: using the customer portal](https://help.housecallpro.com/en/articles/8448657-using-the-customer-portal), 7-day magic links, booking and payment
- [Housecall Pro: sub-customers and multiple addresses](https://help.housecallpro.com/en/articles/932653-what-is-the-difference-between-sub-customers-and-multiple-addresses), parent-child accounts for managers and tenants
- [Housecall Pro: Klarna](https://www.housecallpro.com/resources/how-to-offer-and-market-klarna-to-customers/), financing on residential invoices
- [GorillaDesk: customer portal](https://gorilladesk.com/academy/gorilladesk-training/add-ons/customer-portal/), portal URL, payments and documents
- [PestPac: customer portal](https://www.pestpac.com/features/customer-portal), commercial multi-location access and audit-only users (marketing)
- [ServiceTrade: service portal](https://www.servicetrade.com/features/service-portal/), quote approval, deficiencies and per-customer media visibility (marketing)
- [Skimmer](https://www.getskimmer.com/) and [Pool Brain](https://www.poolbrain.com/features/), service reports with photos as the self-service surface
