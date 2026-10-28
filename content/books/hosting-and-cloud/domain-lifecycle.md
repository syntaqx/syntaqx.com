+++
title = "The Domain Lifecycle"
description = "A domain from creation to release: grace periods and their day counts, expiry notices, DNS interruption, redemption, pending delete, drop catching and auctions."
category = "Hosting & Cloud Industry"
order = 2163
part = "Domains and DNS"
tags = ["domains", "lifecycle", "renewals", "icann", "aftermarket"]
+++

A domain registration is a lease with a long tail. It starts with a few days in which the registrar can change its mind for a refund, runs for one to ten years, and then, if nobody renews it, takes the better part of three months to die: the registry renews it automatically and gives the registrar weeks to reverse that, the registrar parks it and sends notices, someone may buy it at auction while the original registrant can still renew, the registrar deletes it, the registry holds it in redemption for a month, and finally releases it to whoever is fastest at registering it again. Every step has a day count, most of them set by a contract or an ICANN policy, and several of them are moments when the registrar's interest (an auction sale, a restore fee) diverges from its customer's.

This chapter walks the lifecycle for generic TLDs, using .com's published values where registries differ: how the grace periods came to exist, what each one is and what a delete during it costs or refunds, the notices and DNS interruption ICANN requires around expiry, redemption, restore and pending delete, and the drop-catching and auction market that waits at the end. Country-code TLDs set their own lifecycles, often shorter ([ccTLDs](/books/hosting-and-cloud/new-gtlds-and-cctlds#cctlds)). The renewal consent, reminders and cancellation rules that consumer law adds belong to Subscriptions, Renewals & Cancellation Law and the playbook's [The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal). This chapter extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with lifecycle events, expiry notices and per-registry grace periods.

## How the Providers Do It

The registry's clock is the same for every .com registrar; what each registrar does inside it differs, and each publishes its own timeline. As of October 2026:

| Registrar | Before expiry | After expiry, standard price | Recovery after that | Where an unrenewed name goes |
| --- | --- | --- | --- | --- |
| **Cloudflare Registrar** | Auto-renew on by default, at the registry's list price; first attempt about 30 days out, retries to the day before | Expiry emails one day and 20 days after expiry; no transfers while expired | A 30-day Redemption Grace Period; "restoration may require an additional fee" | Not stated |
| **GoDaddy** | Auto-renew attempt on the expiry date | Parked at +5 days; final auto-renew attempt at +12; renewal at the standard price through +12 | From +18 days with a redemption fee, until a pending auction purchase prevents it; removed from the account at +72 | Expired Domains Auction from +26 days, Final Closeout Auction +36 to +41 |
| **Namecheap** | Auto-renew; some ccTLDs (.de, .eu, .fr and others) marked expired days before the registry expiry | Nameservers switched to parking; "about 30 days" to renew at the regular rate | A 30-day Redemption Grace Period "and sometimes longer", at a redemption price "plus a $0.20 ICANN fee for generic TLDs" | May be auctioned before redemption |
| **Network Solutions** | Auto-renew recommended | "Up to a 30-day grace period", with a $35.99 reinstatement fee on top of renewal | A 30-day redemption period through support, $99.00 plus the reinstatement fee | Released to the registry |
| **IONOS** | Cancellation revocable up to 48 hours before term end by turning auto-renew on | A 10-day reactivation window after cancellation, reconnecting the old services | Recovery for up to 30 days after deletion for a one-time $90; mailboxes and settings are not restored | Deleted |
| **Tucows** (OpenSRS) | Per reseller | Nameservers changed to OpenSRS's expired-domain servers on day 3; renewal at the standard rate through day 40 | A 30-day redemption period at "a much higher fee" if the name entered its portfolio | Auction typically days 41 to 45, deletion and drop around days 70 to 75, or kept by its YummyNames portfolio and offered back at a share of fair market value |
| **Porkbun** | Per its terms | The previous registrar may refuse to transfer an expired name; a name renewed and then transferred within 45 days may not gain a year | Not stated on the page opened | Not stated on the page opened |

Three things the table shows. **The registrar's grace window is not the registry's.** The registry gives the registrar 45 days after an auto-renewal to delete for a credit ([Grace Periods](#grace-periods)); GoDaddy's standard-price window ends at 12 days, Namecheap's and Network Solutions' at about 30, OpenSRS's at 40. Each fits inside the registry's 45 and leaves room for an auction. **"Redemption" means two things.** Sometimes it is the registry's Redemption Grace Period after a delete; sometimes it is a registrar's own paid recovery window while the name is still in auto-renew grace (GoDaddy's +18 days, Network Solutions' reinstatement). **The expired name is inventory.** GoDaddy auctions it, OpenSRS auctions it or keeps it, and in both cases the original registrant can still renew until the auction closes or the window ends.

## How We Got Here

**Accidental deletions (to 2003).** Before 2003 a deleted .com name was immediately available to anyone. ICANN's general counsel described the result: customers lost names through accidental deletion, and some of those "domain names that were unintentionally deleted and then registered by someone else" ended up carrying objectionable content, with recovery slow and expensive. ICANN staff proposed a Redemption Grace Period in early 2002; the Board's Accra resolution 02.45 (March 2002) convened a technical steering group to "develop a concrete proposal," and its Bucharest resolution 02.83 (June 2002) authorized registry agreement changes for unsponsored TLDs. ICANN provisionally approved Verisign's implementation on 15 January 2003, with a restore fee of US$85 for the first 2,000 restores and US$40 after, and Verisign's registry introduced the Redemption Service with a software upgrade on 25 January 2003. The cost was a month of limbo before every deleted name became available, and a new registrar product: the paid restore. RFC 3915 mapped it into EPP in September 2004.

**Domain tasting (2006 to 2009).** The five-day Add Grace Period was meant to let registrars undo mistakes. It was used to register millions of names, keep the few that earned advertising revenue within five days, and delete the rest for a full refund; ICANN said that at its peak "millions of dot-com domains" were "registered and returned in one month alone." A short-term ICANN budget provision charged the $0.20 ICANN fee on Add Grace Period deletes above the greater of 10% of a registrar's monthly net new registrations or 50 names, from 1 July 2008 to 30 June 2009, and the GNSO's policy process produced the AGP Limits Policy, which registries had to implement by 31 March 2009 and which cut refunds above that same threshold. ICANN reported a 99.7% decrease in AGP deletes from June 2008 to April 2009.

**Expiry rules for registrars (2013).** The Redemption Grace Period protected names after a delete; nothing yet governed what registrars did between expiry and delete, when many parked expired names, sold them at auction or deleted them early. The GNSO's post-expiration domain name recovery work produced the Expired Registration Recovery Policy, with which every registrar and registry had to comply by 31 August 2013: mandatory notices, DNS interruption so the registrant notices, a guaranteed renewal window, a mandatory 30-day Redemption Grace Period for unsponsored gTLDs, and published fees. The 2013 RAA added the same disclosure duties to the contract (section 3.7.5). ICANN published an updated version of the policy on 21 February 2024 alongside the Registration Data Policy.

## Grace Periods

Each grace period is a registry rule, announced in the domain's statuses ([Statuses](/books/hosting-and-cloud/epp-and-domain-data#statuses)) and published in the registry agreement. Verisign's functional specification for .com gives the values most gTLD registries mirror:

| Period | Starts | Length (.com) | A registrar delete during it | Status |
| --- | --- | --- | --- | --- |
| **Add Grace Period** | Initial registration | Five calendar days | Credits the registration fee; the name is immediately available again | `addPeriod` |
| **Renew/Extend Grace Period** | An explicit renewal | Five calendar days | Credits the renewal fee; the name enters redemption | `renewPeriod` |
| **Auto-Renew Grace Period** | The day after expiry, when the registry renews the name automatically and bills the registrar | 45 calendar days | Credits the auto-renew fee; the name enters redemption | `autoRenewPeriod` |
| **Transfer Grace Period** | A completed transfer | Five calendar days | Credits the transfer fee; the name enters redemption | `transferPeriod` |
| **Transfer Pending Period** | A transfer request | Five calendar days | If the losing registrar neither approves nor rejects, the registry approves automatically | `pendingTransfer` |
| **Redemption Grace Period** | A delete outside the Add Grace Period | 30 calendar days | The name can only be restored | `redemptionPeriod`, `pendingRestore` |
| **Pending Delete Period** | The end of redemption without a restore | Five calendar days | Nothing; the name is purged and released | `pendingDelete` |

Registrations and renewals may total at most ten years. Four mechanics matter for the system:

- **The Add Grace Period refund is capped.** Under the AGP Limits Policy a registry may not refund Add Grace Period deletes in a month above the greater of 10% of the registrar's net new registrations or 50 names, calculated per TLD per month, unless the registry grants an exemption for documented extraordinary circumstances. The grace period is therefore a fraud-loss budget, not a free undo: a registrar that deletes every card-declined registration for a refund will hit the cap in a month of card-testing attacks.
- **Auto-renewal happens at the registry whatever the customer wanted.** The registry renews on the day after expiry and charges the registrar. The registrar then has 45 days to decide: keep the year (the customer renewed, or the registrar will sell the name), or delete for a credit. The 2013 RAA bounds the decision from the other side: a registrant who doesn't consent to renewal within the time in a second notice loses the name "by the end of the auto-renew grace period" absent extenuating circumstances (3.7.5), a terminated registration must be deleted within 45 days (3.7.5.3), and the registrar must tell new registrants when it will delete a non-renewed name, as a date range of no more than ten days (3.7.5.4).
- **Transfers interact with auto-renew grace.** If a .com name is transferred during the auto-renew grace period, the losing registrar is credited the auto-renew charge, "the year added by the Auto-Renew operation is cancelled," and the gaining registrar's transfer adds its own year, which is why Porkbun warns that a name renewed and then transferred within 45 days may not gain a full extra year. Losing registrars may also refuse transfers of expired names, which the Transfer Policy permits in some cases ([The Transfer Flow](/books/hosting-and-cloud/transfers-and-locks#the-transfer-flow)).
- **The values are per registry.** RFC 3915 leaves durations to "registry operational policy", and ccTLDs often have no auto-renew grace at all, which is why registrars like Namecheap mark some ccTLD names expired days before the registry date. The registrar's lifecycle engine reads the days from the registry's row, not from a constant ([How to Build It](#how-to-build-it)).

## Expiry Notices and DNS Interruption

The Expired Registration Recovery Policy sets what a registrar must do around expiry for gTLD names, whoever sends the notices (a reseller included):

- **Before expiry (2.1.1).** At least two notices, one about a month before and one about a week before. ICANN's notes accept 26 to 35 days and 4 to 10 days as compliant.
- **After expiry (2.1.2).** If the name is neither renewed nor deleted within five days after expiry, at least one more notice.
- **DNS interruption (2.2).** A registrar may delete an expired name at any time after it expires, subject to the RAA and policies (2.2.1). If it deletes within eight days of expiry, it must interrupt DNS resolution from expiry until deletion where the registry permits (2.2.2); if later, resolution must be interrupted "for at least the last eight consecutive days (after expiration) that the registration is renewable" (2.2.3). The interruption must still let the registrant renew (2.2.5), and on renewal the registrar must restore the registrant's DNS "immediately or as soon as is commercially reasonable" (2.2.6).
- **Fees (4.1).** Renewal fees, post-expiration renewal fees if different, and redemption or restore fees must be reasonably available at registration and "clearly displayed on the registrar's website."

The interruption is the policy's real notice. Registrants ignore email; they don't ignore a website and mailbox that stopped working. Registrars implement it by switching the name's nameservers to their own parking or expired-domain servers (OpenSRS on day 3, GoDaddy at +5 days, Namecheap at expiry), which is also how the parking page earns advertising revenue during the window. Two consequences for the system: the registrar must remember and restore the customer's own nameservers on renewal, and a name whose mail stops working is a support spike that arrives on a predictable day after every expiry batch.

Notices are a deadline-driven job, and a missed one is a compliance case. Each name gets its notice schedule computed from the registry's expiry when the expiry changes, the sent notices are recorded with the expiry they were for, and a renewal or transfer cancels the rest ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). Notices that are also automatic-renewal reminders under state law carry those rules too ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)).

## Redemption and Pending Delete

**Redemption.** Once the registrar deletes a name outside the Add Grace Period, the registry places it in the Redemption Grace Period: 30 calendar days in .com, and a mandatory 30 days in every unsponsored gTLD under the ERRP (3.1), during which "the registry must disable DNS resolution and prohibit attempted transfers" (3.2) and the registrar must let the registrant redeem it if the registry offers redemption (3.3). Sponsored gTLDs are excluded from the mandate.

**Restore.** Recovering a name from redemption is a two-step EPP operation under RFC 3915: a `restore` with `op="request"` moves the name to `pendingRestore`, and the registrar then sends a restore report (`op="report"`) with the registration data before deletion and now, the deletion and restore times, a reason, and two statements: that it isn't restoring the name to use or sell it itself, and that the report is factual. If no report arrives within the registry's window (ICANN describes "this frequently defined seven day period"), the name falls back to `redemptionPeriod`. The registry charges the registrar a restore fee, and the registrar charges the customer its own: $99.00 plus a $35.99 reinstatement fee at Network Solutions, a one-time $90 at IONOS, a redemption price plus the $0.20 ICANN fee at Namecheap, as of October 2026. The RAA requires the registrar to show that fee at registration and on its website (3.7.5.6).

**Pending delete and release.** A name not restored by the end of redemption carries `pendingDelete` alone and, in .com, is purged "after five calendar days following the end of the redemptionPeriod" and becomes available to register. A name the registrar deleted within the Add Grace Period skips all of this and is available at once.

The registrar's restore flow has three failure modes worth designing for. The restore report is a signed statement, so it needs the pre-deletion data the registrar still holds. The restore fee is owed to the registry whether or not the customer's payment clears, so the order is payment first. And a restored name returns with its old nameservers only if the registrar reapplies them, so the restore puts back the customer's delegation and DNSSEC data from the registrar's own records.

## Drop Catching and the Aftermarket

A valuable name rarely makes it to the open market. Three routes compete for it:

- **The registrar's expired-name auction.** While the name sits in auto-renew grace, its registrar still sponsors it and can sell it: GoDaddy lists names on its Expired Domains Auction from +26 days and a Final Closeout Auction from +36, and OpenSRS runs auctions around days 41 to 45. The winner takes over a registration the registrar still sponsors, and the original registrant can renew until the auction resolves. Names that don't sell may stay with the registrar: Tucows' YummyNames portfolio keeps some and offers them back to the original registrant at 50% of fair market value (minimum $200) for a time, then at full value.
- **Backorders on pending-delete names.** Services take backorders and try to register the name the moment it drops. NameJet and SnapNames pooled their pending-delete backorders from April 2016, fulfilling an order through whichever service received it and running a shared private auction where several bidders backordered the same name; "direct transfer" names that skip deletion were outside the pool.
- **Drop catching at the registry.** When a name is purged, the first create wins. Registries rate-limit registration attempts per registrar, so drop catchers multiply connections by multiplying accreditations: by December 2016, DropCatch had at least 1,252 accreditations, about 43% of all ICANN-accredited registrars, having paid $1.75 million in application fees for its latest 500.

The aftermarket sits on top. GoDaddy's 10-K describes an auction marketplace that spans registrars, a portfolio of about 1.0 million names of its own, and the risk of "failed sales" where it is the primary obligor; IONOS reported its Sedo marketplace as held for sale in 2025. The system point is a conflict of interest the registrar has to manage in the open: the same company that sends the expiry notices profits when they fail. My rule is to separate the two in code and in records. The lifecycle engine sends every notice, interrupts DNS and offers renewal on the published schedule regardless of whether a name has auction bids; the aftermarket system sees a name only once the registrant's standard renewal window has closed; and the registrant can always renew until the moment the name is legally someone else's.

## My Default

My default lifecycle for a gTLD registrar: auto-renew on by default with consent recorded at checkout, the first renewal attempt 30 days before expiry with retries, the ERRP notices at about 30 and 7 days before and 3 days after expiry, DNS interruption from day 5 with the customer's nameservers saved, standard-price renewal through day 30, the registrar's delete on day 35 so the name enters redemption well inside the 45-day auto-renew credit, and a published restore fee priced at cost plus handling rather than as a penalty. Auctions, if any, only after day 30 and only for names whose registrants were notified on schedule.

The tradeoff is revenue. A shorter standard-price window and an earlier auction (GoDaddy's +12 and +26) earn more from expired names and lose more customers who were late rather than gone; a 40-day window like OpenSRS's keeps more customers and leaves less to sell. I'd lean long because the renewal is the business (the [foundation](/books/hosting-and-cloud/hosting-and-cloud-business#how-the-money-is-made) shows how much of hosting revenue is renewals) and because a registrant who loses a name to an auction while still able to renew is the complaint that reaches ICANN, the press and a court.

## How to Build It

The core `domains` table mirrors the registry's expiry, and [The Domain Data Model & EPP](/books/hosting-and-cloud/epp-and-domain-data#how-to-build-it) logs each command and holds the grace-period statuses. This chapter adds the registry's lifecycle values, the registrar's own published policy, a lifecycle event history and the notice schedule.

```sql
ALTER TABLE registries                   -- the registry's clock, per TLD
  ADD COLUMN add_grace_days        SMALLINT NOT NULL DEFAULT 5,
  ADD COLUMN renew_grace_days      SMALLINT NOT NULL DEFAULT 5,
  ADD COLUMN auto_renew_grace_days SMALLINT,   -- 45 for .com; null: no auto-renew at registry
  ADD COLUMN transfer_grace_days   SMALLINT NOT NULL DEFAULT 5,
  ADD COLUMN redemption_days       SMALLINT,   -- 30 for unsponsored gTLDs; null: no RGP
  ADD COLUMN restore_report_days   SMALLINT,   -- the registry's window for the report
  ADD COLUMN pending_delete_days   SMALLINT,
  ADD COLUMN expires_before_registry_days SMALLINT NOT NULL DEFAULT 0,  -- ccTLDs the registrar expires early
  -- the registrar's own published policy for this TLD, inside the registry's windows:
  ADD COLUMN dns_interrupt_after_days  SMALLINT NOT NULL DEFAULT 5,
  ADD COLUMN standard_renewal_days     SMALLINT NOT NULL DEFAULT 30,
  ADD COLUMN registrar_delete_after_days SMALLINT NOT NULL DEFAULT 35,
  ADD CONSTRAINT registries_delete_inside_grace CHECK (auto_renew_grace_days IS NULL
    OR registrar_delete_after_days < auto_renew_grace_days),
  ADD CONSTRAINT registries_interrupt_before_delete CHECK (
    registrar_delete_after_days - dns_interrupt_after_days >= 8
    OR dns_interrupt_after_days = 0);    -- ERRP 2.2.3: the last eight renewable days

CREATE TABLE domain_lifecycle_events (   -- what happened to a name, in order
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  domain_id          UUID NOT NULL REFERENCES domains (resource_id),
  event              TEXT NOT NULL CHECK (event IN ('created', 'renewed', 'auto_renewed',
                       'expired', 'dns_interrupted', 'dns_restored', 'auction_listed',
                       'auction_sold', 'deleted', 'add_grace_deleted', 'restore_requested',
                       'restore_reported', 'restored', 'purged', 'transferred_in',
                       'transferred_out')),
  occurred_at        TIMESTAMPTZ NOT NULL,      -- registry time when it comes from the registry
  expires_at_after   TIMESTAMPTZ,               -- the registry's exDate after this event
  years              SMALLINT,                  -- added by create, renew or transfer
  grace_period       TEXT CHECK (grace_period IN ('add', 'renew', 'auto_renew', 'transfer')),
  credit_expected    BOOLEAN NOT NULL DEFAULT FALSE,  -- a delete inside a grace period
  epp_transaction_id UUID REFERENCES epp_transactions (id),
  saved_nameservers  TEXT[],                    -- the customer's delegation, on interruption
  actor              TEXT NOT NULL,             -- 'system:lifecycle', 'customer:...', staff
  CHECK (event NOT IN ('add_grace_deleted') OR grace_period = 'add'),
  CHECK (event <> 'dns_interrupted' OR saved_nameservers IS NOT NULL)
);
CREATE INDEX domain_lifecycle_events_by_domain
  ON domain_lifecycle_events (domain_id, occurred_at);

CREATE TABLE expiry_notices (            -- the ERRP schedule, computed and recorded
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  domain_id        UUID NOT NULL REFERENCES domains (resource_id),
  notice           TEXT NOT NULL CHECK (notice IN ('pre_expiry_first', 'pre_expiry_second',
                     'post_expiry')),
  for_expires_at   TIMESTAMPTZ NOT NULL,   -- the expiry this notice is about
  due_window       TSTZRANGE NOT NULL,     -- e.g. 26 to 35 days before for the first
  rule_version     TEXT NOT NULL,          -- which policy text computed the window
  sent_at          TIMESTAMPTZ,
  sent_by          TEXT CHECK (sent_by IN ('registrar', 'reseller')),
  notification_id  UUID,                   -- the message log entry
  cancelled_reason TEXT CHECK (cancelled_reason IN ('renewed', 'transferred_out',
                     'deleted', 'expiry_changed')),
  UNIQUE (domain_id, notice, for_expires_at),
  CHECK (sent_at IS NULL OR cancelled_reason IS NULL),
  CHECK (sent_at IS NULL OR due_window @> sent_at OR notice = 'post_expiry')
);

-- Notices due now and not yet sent: the scheduler's work list.
CREATE VIEW expiry_notices_due AS
SELECT n.*
FROM expiry_notices n
WHERE n.sent_at IS NULL AND n.cancelled_reason IS NULL AND n.due_window @> NOW();
```

Notes on the sketch:

- **The registry's clock and the registrar's are separate columns.** The registry's grace periods come from its agreement; the registrar's own timings (when DNS is interrupted, how long the standard price holds, when it deletes) are its published policy for that TLD, constrained to fit inside the registry's windows and the ERRP's eight-day rule. Publishing the policy page from these columns keeps what customers read and what the system does the same, which RAA 3.7.5.5 requires.
- **Events are history; the mirror is state.** `domains.expires_at` is the registry's current `exDate`; `domain_lifecycle_events` records every change with the expiry after it, so "when did this name expire, what notices did it get, and who renewed it" is answerable after a dispute, a transfer or a court order. Events from the registry use the registry's timestamps.
- **Notices are rows before they are messages.** When the expiry changes, the job cancels the old schedule (`expiry_changed`) and computes a new one with the policy version that produced the windows; the notification system sends from the due view through the playbook's [One Outbound Gate](/docs/architecture/notifications#one-outbound-gate), and the row records which message went out. A reseller that sends its own notices records them here too, because the registrar answers for them.
- **Interruption saves what it replaces.** The `dns_interrupted` event stores the customer's nameservers so renewal can restore them, along with DNSSEC data from the zone records; a restore from redemption reapplies them the same way.
- **Grace credits are reconciled.** A delete inside a grace period sets `credit_expected`, and finance matches it against the registry's credit, because a delete one day late is a lost name-year and the AGP cap can deny a refund the code assumed.
- **Auctions wait for the lifecycle.** An `auction_listed` event can't precede the end of the TLD's `standard_renewal_days`, enforced in the service that lists names, so a sale never races the registrant's renewal right.
- **Events:** `domain.expiring`, `domain.expired`, `domain.dns_interrupted`, `domain.renewed`, `domain.deleted`, `domain.restored` and `domain.purged` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, billing, the aftermarket, support and DNS hosting.

## Auditing

- **Every notice for every expiry.** The window, the send time, the channel, the sender (registrar or reseller) and the message, because the ERRP is enforced by complaint and Compliance asks for exactly this.
- **Every interruption and restoration.** When DNS was interrupted, what was saved, when it came back, so a registrant's "my site went down without warning" can be answered.
- **Every delete and its credit.** Which grace period, the credit expected and received, the AGP cap position per TLD per month, and any exemption request with its documentation.
- **Every restore.** The request, the report as sent (with its statements), the registry's fee and the customer's fee, and the published fee at the time.
- **Every expired-name sale.** When the name was listed, what notices preceded it, the registrant's last chance to renew, and who bought it, because a sale during the renewal window is the lifecycle's most serious failure.
- **The published policy over time.** Each version of the deletion and auto-renewal policy and the restore fee, as displayed, with the dates in force.

## What This Means for the System You Build

- **Read grace periods from the registry's row,** never constants, and fit your own published timings inside them.
- **Treat the Add Grace Period as a capped fraud budget,** not a free undo.
- **Compute and store the notice schedule** from the registry's expiry, and record every notice with the expiry it was for.
- **Interrupt DNS on schedule and save what you replace,** so renewal and restore put the customer back exactly as they were.
- **Delete inside the auto-renew grace period** to recover the registry's charge, and reconcile every credit.
- **Make restore a two-step, payment-first flow** that can produce the report from your own records.
- **Keep the aftermarket behind the lifecycle:** no listing until the standard renewal window closes, and renewal possible until the name is sold.

## References

**Policies and contracts**

- [ICANN: Expired Registration Recovery Policy](https://www.icann.org/resources/pages/errp-2013-02-28-en), pre- and post-expiry notices (2.1), the 26 to 35 and 4 to 10 day windows, DNS interruption and renewal (2.2), the 30-day Redemption Grace Period and its exclusions (3), fee display (4.1), compliance by 31 August 2013, the 21 February 2024 update
- [ICANN: Add Grace Period Limits Policy](https://www.icann.org/resources/pages/agp-policy-2008-12-17-en), the five-day AGP, the refund cap of the greater of 10% or 50 names per TLD per month, exemptions, implementation by 31 March 2009
- [ICANN: .com Registry Agreement, Appendix 7, Functional and Performance Specifications](https://www.icann.org/en/registry-agreements/com/com-registry-agreement-functional-and-performance-specifications-06-01-2010-en), the add, renew, auto-renew, transfer, redemption, pending delete and transfer pending periods, credits and the ten-year limit
- [ICANN: 2013 Registrar Accreditation Agreement](https://www.icann.org/resources/pages/approved-with-specs-2013-09-17-en), renewal consent, extenuating circumstances, deletion within 45 days, deletion policy disclosure and the redemption fee (3.7.5 to 3.7.5.7)
- [ICANN: EPP status codes](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en), redemptionPeriod for 30 days, the restore report window, purge five days after redemption

**History**

- [ICANN: General Counsel's briefing on the .com and .net Redemption Grace Period (2003)](https://www.icann.org/resources/unthemed-pages/report-vgrs-rgp-consolidate-2003-02-23-en), the accidental-deletion problem, resolutions 02.45 and 02.83, the 15 January 2003 approval, the restore fee and the 25 January 2003 launch
- [ICANN: The end of domain tasting, AGP deletes decrease 99.7% (12 August 2009)](https://www.icann.org/en/announcements/details/the-end-of-domain-tasting--agp-deletes-decrease-997-12-8-2009-en), peak tasting volumes and the decrease
- [ICANN: The end of domain tasting, status report on AGP measures (12 August 2009)](https://www.icann.org/resources/pages/agp-status-report-2009-08-12-en), the budget provision from 1 July 2008 to 30 June 2009 and the $0.20 fee on excess deletes

**Specifications**

- [RFC 3915: Domain Registry Grace Period Mapping for EPP](https://www.rfc-editor.org/rfc/rfc3915), grace-period statuses, restore request and report contents, durations left to registry policy

**Providers**

- [Cloudflare: Renew domains](https://developers.cloudflare.com/registrar/account-options/renew-domains/), auto-renew timing and retries, expiry emails, the 30-day redemption period
- [GoDaddy: What happens after my domain expires?](https://www.godaddy.com/help/what-happens-after-my-domain-expires-609), the day-by-day timeline, parking, redemption fee and auctions
- [Namecheap: What happens to my domain name after it expires?](https://www.namecheap.com/support/knowledgebase/article.aspx/10064/2207/what-happens-to-my-domain-na), parking at expiry, 30 days in the account, early-expiring ccTLDs
- [Namecheap: Generic TLDs' grace periods](https://www.namecheap.com/support/knowledgebase/article.aspx/9916/2207/tlds-grace-periods), about 30 days at the regular rate, redemption of 30 days or longer, the ICANN fee on redemption
- [Network Solutions: Renewal timelines](https://www.networksolutions.com/help/article/renewal-timelines), the grace period, reinstatement and redemption fees
- [IONOS: Reactivating an expired domain](https://www.ionos.com/help/domains/terms-and-cancellations/reactivating-an-expired-domain/), the 10-day reactivation, 30-day recovery for $90, what isn't restored
- [OpenSRS: Redeeming an expired domain](https://support.opensrs.com/support/solutions/articles/201000063315), nameserver change on day 3, 40-day grace, auctions, redemption, drop, and portfolio pricing
- [Porkbun: Transferring an expired domain](https://kb.porkbun.com/article/56-what-happens-when-my-domain-expires), losing registrars refusing expired transfers and renewals within 45 days of a transfer

**Aftermarket**

- [Domain Name Wire: NameJet and SnapNames combine pending-delete backorders (11 April 2016)](https://domainnamewire.com/2016/04/11/namejet-snapnames-pending-delete-domain-names/), the shared pool and private auctions
- [Domain Incite: DropCatch spends millions to buy five hundred more registrars (2 December 2016)](https://domainincite.com/tag/premiums/page/3), at least 1,252 accreditations, 43% of registrars, registry rate limits
- [SEC: GoDaddy Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), the aftermarket, its own portfolio and failed-sale risk
- [IONOS Group: FY2025 results (19 March 2026)](https://www.ionos-group.com/fileadmin/Publications/Pressemitteilungen/20260319_IONOS_FY_2025_Results_EN.pdf), Sedo reported as held for sale
