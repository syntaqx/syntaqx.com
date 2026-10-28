+++
title = "Email Hosting"
description = "How hosts sell mailboxes: bundled cPanel mail on Exim and Dovecot, white-labeled pro email, Google Workspace and Microsoft 365 resale, and relay limits."
category = "Hosting & Cloud Industry"
order = 2160
part = "Web Hosting"
tags = ["email", "mailboxes", "exim", "dovecot", "google-workspace", "microsoft-365"]
+++

A small business that buys hosting and a domain expects `name@theirbusiness.com` to work, and for most of the industry's history the host delivered it on the same server as the website: a control panel account with mailboxes, an MTA, an IMAP server and webmail, all inside the hosting plan. That bundle still ships with nearly every shared plan. Alongside it, hosts now sell two other things under the word "email": a paid "professional email" add-on, usually a third party's mail platform under the host's brand, and resold seats of Google Workspace or Microsoft 365, where the host is a reseller and the mailbox lives at Google or Microsoft.

The three products have the same customer and very different economics. Bundled mail costs the host disk, an IP address's reputation and abuse-desk time, and earns nothing directly. Pro email is a margin product with an intro price and a renewal price. Resale earns a partner margin on someone else's service and hands the host the billing and first-line support. All three depend on the same DNS records the host usually manages for the customer, and all three leave the host answerable when a hosted mailbox or a compromised site starts sending spam.

This chapter covers how the providers sell mail, how email hosting got here, how panel mail works (Exim, Dovecot, Roundcube, SpamAssassin and the relay limits), the DNS a mailbox host owns, outbound limits and why clouds block port 25, pro email and resale, moving mail, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with the `mailboxes` side table and the tables around it. Sending mail at volume, as a platform for other companies' messages, is [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms); Gmail, Yahoo and Microsoft's rules for bulk senders and their enforcement are [Inbox Rules](/books/hosting-and-cloud/inbox-rules). SPF, DKIM, DMARC and message streams for an application that sends its own mail are the playbook's [Email: Authentication and Streams](/docs/architecture/notifications#email-authentication-and-streams), and the marketing-email law is [Email: CAN-SPAM](/docs/compliance/consumer-contact#email-can-spam).

## How the Providers Do It

Mail as each host's public pages describe it, as of October 2026:

| Provider | Bundled with hosting | Paid mailbox product | Platform behind it | Resale | Limits stated |
| --- | --- | --- | --- | --- | --- |
| **Bluehost** | cPanel mail; Starter capped at 100 MB per address | Professional Email: 10 GB at $1.99/mo intro, $2.99 renewal; 50 GB and 100 GB tiers | "Powered by Titan" (MX at `mx1.titan.email`) | Points customers to Google Workspace as an alternative | |
| **GoDaddy** | Not covered here | Professional Email, 1 GB to 100 GB tiers | "Powered by Titan" | Microsoft 365 from GoDaddy, 10 GB to 100 GB mailboxes | 500 SMTP relays per mailbox per day; 1,500 a day from webmail; 100 recipients per message |
| **Hostinger** | A 1-year free trial mailbox, 1 GB, 100 sends a day | Business Starter 5 GB from $0.39/mo on 48 months, renews $1.59; Premium 50 GB | Its own "Hostinger Email" (Titan plans still documented) | | Starter 1,000 a day, Premium 3,000 a day, 100 recipients |
| **IONOS** | | IONOS Email from $1.10/mo, 2 GB, then $2 | Its own mail; Exchange as "Outlook & Office" | "Business Gmail" (Google Workspace) | |
| **SiteGround** | Included on hosting plans | | Its own | | 400 emails an hour per site (800 on GoGeek and Cloud), 80 recipients, each recipient counted |
| **DreamHost** | Three-month Professional Email trial on Web Hosting; unlimited on DreamPress, VPS and Dedicated | Professional Email, $1.99/mo per mailbox (or $1.67 yearly), 25 GB | Its own | | 100 recipients an hour per address over SMTP; 200 an hour per server for PHP and CGI on shared |
| **Namecheap** | cPanel mail, 10 GB total on Shared Hosting | Private Email: 5 GB, 30 GB, 75 GB plans | Not stated on opened pages | | Private Email 500 an hour per mailbox; shared hosting 50 to 10,000 an hour per domain by plan |

What the table shows:

- **Bundled mail is shrinking to a trial.** Hostinger's free mailbox is a one-year trial, DreamHost's shared plans include a three-month trial of the paid product, and Bluehost caps Starter mailboxes at 100 MB and names its paid product or Google Workspace as the way past it. The bundle is becoming the funnel for the add-on.
- **Pro email is often one vendor under many brands.** Titan lists WordPress.com, GoDaddy, Hostinger, name.com, HostGator, Bluehost and Squarespace among the brands that offer it. A customer comparing two hosts' "professional email" may be comparing the same mail platform at two prices.
- **Limits are published per mailbox, per domain and per hour, and count recipients.** SiteGround and DreamHost both say a message to ten people counts as ten. That is the unit spam is measured in.

## How Email Hosting Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 1980 to 1981 | Eric Allman's delivermail ships with 4.0 and 4.1 BSD; work on sendmail begins in March 1981 | Routing mail between the networks of the day | A configuration language few could read, and decades of security fixes |
| Aug 1982 | RFC 821, SMTP (Jon Postel) | One protocol for moving mail between hosts | No authentication of the sender |
| Jan 1986 | RFC 974, MX records: "the lowest numbered MX being the one to try first" | Mail for a domain delivered to servers other than the web host | The domain's DNS becomes part of the mail system |
| Jul 1988 | RFC 1064, IMAP2 (Mark Crispin) | Reading mail kept on the server from any client | Mail storage moves to the provider |
| End of 1995 | Exim goes into service at the University of Cambridge (Philip Hazel) | A configurable, safer MTA | |
| May 1996 | RFC 1939, POP3 | Downloading mail to one client | |
| 14 Dec 1998 | Postfix (formerly VMailer, Wietse Venema) released as open source | A sendmail-compatible MTA built for security | |
| 2002 | Dovecot's first release | A fast, secure IMAP and POP3 server | |
| Mar 2003 | RFC 3501, IMAP4rev1 | | |
| 28 Aug 2006 | Google Apps for Your Domain: Gmail on a customer's own domain, free in beta with 2 GB per user | Hosted mail without running a server | A host's mailbox competes with Google's |
| Oct 2008 | RFC 5321 replaces RFC 821 and RFC 974 as the SMTP standard | One current specification for transfer and MX handling | |
| 28 Jun 2011 | Office 365 launches in 40 markets; small business plan $6 per user per month | Exchange as a subscription | Same, from Microsoft |
| Sep 2011 | RFC 6376, DKIM | Signing mail so a receiver can verify the domain | Keys per domain, published in DNS |
| Apr 2014 | RFC 7208, SPF, with a limit of 10 DNS-querying terms | Listing which servers may send for a domain | Forwarding breaks it |
| Mar 2015 | RFC 7489, DMARC (Informational) | A domain's policy for failed authentication, with reports | |
| 29 Sep 2016 | Google Apps for Work becomes G Suite | | |
| 6 Oct 2020 | G Suite becomes Google Workspace | | |
| Aug 2021 | RFC 9051, IMAP4rev2 | | |
| 1 Feb 2024 | Gmail's sender requirements take effect | Unauthenticated bulk mail | Every host's outbound mail held to them |
| May 2026 | RFC 9989, DMARC on the Standards Track, with RFCs 9990 and 9991 for reporting | DMARC as a standard; a DNS tree walk instead of relying only on the Public Suffix List; the `pct` tag removed | Hosts' DMARC tooling updated |

## How Panel Mail Works

On a cPanel & WHM server, mail is four components and a set of package limits:

- **Exim** is the MTA: "Exim is a mail transfer agent that cPanel & WHM includes." Its configuration in WHM covers the SpamAssassin reject threshold, DKIM verification of incoming mail (which the documentation warns "can slow your server's performance"), ARC signing, SRS so forwarded mail still passes SPF, and sender verification, on by default.
- **Dovecot** serves IMAP and POP3 from mailboxes in the `mdbox` format; defaults allow 20 simultaneous IMAP connections and 3 POP3 connections per IP address. Webmail requires IMAP.
- **Roundcube** is the webmail. cPanel removed Horde because "Horde relies on PHP 7.4, which reached End-of-Life on November 28, 2022," migrating Horde calendars and contacts to Roundcube; SquirrelMail was deprecated, then removed.
- **Apache SpamAssassin** scores every message; the customer sets a spam threshold ("a lower spam threshold score, such as a one, is aggressive... ten, is passive") and a separate auto-delete threshold that "permanently deletes" mail. The host can force scanning on. **BoxTrapper**, the challenge-response option, "automatically sends a verification email in response" to unknown senders, which means mail to the forged sender of every spam it receives.

The **package** sets what each account can have: the number of email accounts, the quota per mailbox, mailing lists, the hourly email relay limit per domain (capped by the server's setting) and the maximum percentage of failed or deferred messages before outbound mail is blocked. Server-wide, **Tweak Settings** holds "Max hourly emails per domain" and "Maximum percentage of failed or deferred messages a domain may send per hour" (both Unlimited by default) and the number of failures before that protection can trigger (5 by default). The packages and feature lists themselves are [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm#packages-and-feature-lists)'s.

**Email Routing** decides whether the server accepts mail for a domain: *Local* delivers to the local mailbox, *Backup* holds mail "until a lower-numbered mail exchanger becomes available," *Remote* sends everything to the lowest-numbered MX, and *Automatically Detect*, "the recommended setting," chooses from the domain's MX records. Getting this wrong is a classic host problem: a customer moves mail to Google Workspace, the panel still thinks it is local, and mail sent from scripts on the same server is delivered to an abandoned local mailbox instead of going out.

The services listen on 25, 465 and 587 for SMTP, 110 and 995 for POP3, 143 and 993 for IMAP, and 2095 and 2096 for webmail, with cPanel recommending the TLS port of each "whenever possible."

## The DNS a Mailbox Host Owns

A mailbox host is responsible for five things in the customer's DNS and its own, and cPanel's **Email Deliverability** page checks three of them per domain (DKIM, SPF and PTR):

| Record | What it says | The host's job |
| --- | --- | --- |
| **MX** | Which servers receive mail for the domain, lowest preference first | Publish the right ones; keep routing consistent with them |
| **SPF** (TXT) | Which servers may send as the domain; at most 10 DNS-querying terms | Include the host's outbound servers; warn when a customer's record exceeds the lookup limit |
| **DKIM** (TXT at `selector._domainkey`) | The public key that verifies the domain's signatures | Generate a key per domain, publish it, sign outbound mail, rotate |
| **DMARC** (TXT at `_dmarc`) | The domain's policy when SPF and DKIM don't align, and where to send reports | Offer a starting record (`p=none` with reports); show the reports to the customer |
| **PTR** | The reverse name of the sending IP | Match it to the server's forward name; this one is the host's, not the customer's |

Gmail's requirements, in force since 1 Feb 2024, make these mandatory rather than good practice: every sender needs SPF or DKIM, valid forward and reverse DNS, and TLS, with spam rates in Postmaster Tools below 0.30% (target below 0.10%); senders of more than 5,000 messages a day to Gmail also need SPF and DKIM and DMARC and one-click unsubscribe. A shared mail server's IP address carries every customer's mail, so one customer without DKIM, or one compromised mailbox, affects all of them. The receivers' rules and their enforcement are [Inbox Rules](/books/hosting-and-cloud/inbox-rules#what-the-rules-require-as-a-platform-sees-them); the application-side mechanics are [Email: Authentication and Streams](/docs/architecture/notifications#email-authentication-and-streams).

## Outbound Limits and Port 25

Every mail server on a shared host is one compromised WordPress plugin or one phished mailbox password away from sending spam on the host's IP addresses, so hosts cap outbound mail at several levels:

| Host | Limit |
| --- | --- |
| **SiteGround** | 400 an hour per site (800 on GoGeek and Cloud); 80 recipients per message; each recipient counts |
| **DreamHost** | 100 recipients an hour per address over SMTP; 200 an hour per server for PHP and CGI on shared; none on Managed VPS or Dedicated |
| **Hostinger** | PHP `mail()` 10 a minute and 100 a day; cPanel plans 200 or 300 an hour with 25% deferred allowed; mailboxes 100 to 3,000 a day by plan |
| **Namecheap** | Shared hosting 50 (Stellar) to 10,000 (Stellar Business) an hour per domain; 100 recipients; Private Email 500 an hour per mailbox |
| **GoDaddy** (Professional Email) | 500 SMTP relays per mailbox a day |
| **Microsoft 365** (Exchange Online) | 10,000 recipients a day, 30 messages a minute |

Clouds go further and block the port. DigitalOcean blocks SMTP ports 25, 465 and 587 on Droplets "to prevent spam and other abuses"; AWS blocks port 25 to public addresses by default and lifts it on request; Google Compute Engine blocks connections to destination port 25 outside the VPC; Azure blocks outbound port 25 on most subscription types but not authenticated relay on 587. The pattern: a host that sells mailboxes runs outbound mail through its own relays with limits it can see, and a host that sells servers stops them from becoming mail servers unless the customer asks and is vetted.

The limits matter twice. They cap the damage of a compromise, and they are the alarm: the deferral and failure rates that cPanel's protections count are the first signal that a mailbox is sending to lists it never had. When the alarm goes off, the abuse desk's sequence applies, narrowest first: suspend outbound for the mailbox, force a password reset, then act on the account ([Intake](/books/user-generated-platforms/abuse-desks#intake); [Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown); [Abuse on Infrastructure](/books/hosting-and-cloud/abuse-on-infrastructure)).

## Pro Email

The paid mailbox add-on exists because bundled mail is a cost center and customers will pay for a better one. The public pages show the shape:

- **Priced like hosting.** Intro and renewal prices (Bluehost $1.99 to $2.99, Hostinger $0.39 to $1.59 on a 48-month term), monthly and yearly options (DreamHost), and trials that convert to paid. The disclosure and consent rules for trials and renewals are [Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law)'s.
- **Bigger mailboxes, separate limits.** 5 to 100 GB per mailbox, against bundled caps of 100 MB (Bluehost Starter) or 10 GB per account (Namecheap shared).
- **Off the web server.** The mailbox moves to a mail platform, so a site's compromise or a full disk doesn't take mail with it, and the MX points to the vendor (`mx1.titan.email` for Bluehost's).
- **White-labeled.** Titan powers the products at Bluehost and GoDaddy and lists more brands; Hostinger still documents Titan plans next to its own. The host sells, bills and supports; the vendor runs the mail.

## Google Workspace and Microsoft 365 Resale

Resale gives a customer the market's two dominant business mail suites with the host's billing and help. The partner terms are not public; the program pages and APIs are.

**Google Workspace.** A host must enroll as an authorized reseller and have "a fully executed and signed reseller contract" to use the Partner Sales Console and the **Reseller API**. In the API the relationships are "resellers, customers, payment plans, product SKUs, and licenses," and a subscription is the primary resource; its `subscriptionId` changes when the subscription changes, so it isn't a durable key. Plans are `ANNUAL_MONTHLY_PAY` and `ANNUAL_YEARLY_PAY` (annual commitments with `numberOfSeats`), `FLEXIBLE` (monthly, with `maximumNumberOfSeats`, upgradable to annual) and a 30-day `TRIAL`. Moving an existing customer to the reseller takes a transfer token from the customer, "specific to your reseller ID" and valid for 30 days. Google's list price, as of October 2026, starts at $7 per user per month for Business Starter with 30 GB, $14 for Standard with 2 TB.

**Microsoft 365.** Resale runs through the **Cloud Solution Provider** program in one of two models. *Indirect* resellers buy through "qualified distributors (formerly known as indirect providers)." *Direct-bill* partners buy from Microsoft and must "sell to, bill, manage, and support their customers autonomously"; becoming one requires twelve months as an indirect reseller, at least USD 1 million of trailing CSP revenue, a capabilities assessment, a managed service, a Solution Partner designation and a paid support plan. Customers accept the Microsoft Customer Agreement. Since 1 Sep 2024 all license-based purchases are on the **New Commerce Experience**, with monthly, annual or three-year terms, and a subscription "can only be canceled in the first seven days of their term," with a prorated refund and no reopening of the window until renewal. Exchange Online mailboxes on Business Basic and Standard are 100 GB.

Three consequences for a reseller's systems:

- **Seat changes are commitments.** A Workspace annual plan's seat count and an NCE annual term are paid for the term; a seat added by mistake on day nine can't be refunded. The host's billing has to know the vendor's commitment and cancellation window for every seat change and show it to the customer before the change, not after.
- **The vendor's identifiers are the record.** The customer's Google customer ID or Microsoft tenant, the vendor's subscription, and the reseller relationship (including a transfer in or out) are what support, billing and a dispute will need.
- **The customer can leave the reseller and keep the mailbox.** Google's transfer token and Microsoft's partner relationships let a customer move between resellers without moving mail, which makes resale a support and billing business, not a lock-in.

## Migrating Mail

Mail is the part of a hosting migration customers notice. Hostinger states it outright: "Email is not part of website migration." WHM's Live Transfer is the exception that carries it, updating MX records (unless the domain uses remote mail servers) and proxying mail to the destination until DNS catches up. Everywhere else, a mail move is: create the mailboxes at the destination, copy existing mail over IMAP, lower the MX TTL ahead, switch MX, copy again until the old server stops receiving, then switch clients' settings and retire the old mailboxes. Google notes new MX records can take up to 72 hours to be recognized, which is the window in which mail arrives at both. The DNS sequence is [DNS and MX Cutover](/books/hosting-and-cloud/backups-and-migrations#dns-and-mx-cutover).

## The Alternatives

| Approach | Model | Strengths | Failure modes | Ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Bundled panel mail** | Exim, Dovecot and Roundcube on the hosting server | Included; one bill; any number of addresses within the package | Shares disk and IP reputation with the sites; small quotas; outages with the server | The host, on open-source software | Included in the plan | Small businesses on shared plans |
| **White-labeled pro email** | A mail platform vendor under the host's brand | Larger mailboxes; off the web server; host support | Intro-to-renewal price jump; vendor dependency hidden from the customer | The vendor runs it, the host sells it | A few dollars per mailbox a month | Hosts' add-on buyers |
| **Host's own mail platform** | A dedicated mail cluster the host operates | Margin and control; separate from web servers | The host owns spam, reputation and storage at scale | The host | Per mailbox | Hostinger, IONOS, DreamHost, SiteGround |
| **Resold Workspace or 365** | Google or Microsoft runs the mailbox; the host bills and supports | The suites customers ask for by name; vendor-grade deliverability and security | Commitment terms and cancellation windows; thin margins; the customer can move resellers | Google or Microsoft; the host as partner | Vendor list price, partner margin | Businesses wanting Gmail or Outlook |
| **Direct with the vendor** | The customer buys Workspace or 365 directly; the host only publishes DNS | No reseller in the middle | The host still gets the DNS tickets | The vendor | List price | Most businesses past a few seats |

## My Default

My default for a host is to keep bundled mail but run it off the web servers: a separate mail tier with per-mailbox outbound limits counted by recipient, DKIM keys and SPF published automatically for every hosted domain, a DMARC starter record offered at setup, PTR managed by the host, SpamAssassin-class filtering on by default, and challenge-response turned off. Then resell Google Workspace and Microsoft 365 for customers who want them, with the commitment and cancellation window shown on every seat change, rather than building a pro email tier that competes with them. White-labeled pro email is a reasonable middle only if the vendor's identity, the renewal price and the export path are stated on the product page.

For a customer, my default is the suite they already use at work, bought directly or through the host, and bundled mail only for a site's form notifications and low-stakes addresses. The tradeoff that would change the host default is scale: a host with millions of mailboxes may earn more running its own mail platform, as several in the table do, but only if it staffs the abuse and deliverability work that comes with owning the IP addresses.

## How to Build It

The chapter owns the `mailboxes` side table (the `'mailbox'` kind is in the core), plus `mail_domains`, `mail_forwarders`, `resold_mail_tenants` and `resold_seat_changes`. Sending identities for platform sending are the core's `sender_identities` and belong to [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms#how-to-build-it); resold seats are billed through the core's subscriptions with a SKU marked `pass_through = 'license'`.

```sql
CREATE TABLE mail_domains (              -- a domain whose mail this account's service handles
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  hosting_account_id  UUID REFERENCES resources (id),       -- kind = 'hosting_account'
  domain              TEXT NOT NULL,     -- A-label, lowercase
  provider            TEXT NOT NULL CHECK (provider IN ('panel', 'mail_platform',
                        'white_label_vendor', 'google_workspace', 'microsoft_365')),
  routing             TEXT NOT NULL CHECK (routing IN ('auto', 'local', 'backup', 'remote')),
  dkim_selector       TEXT,
  mx_ok_at            TIMESTAMPTZ,       -- last check that MX matches provider and routing
  spf_ok_at           TIMESTAMPTZ,
  dkim_ok_at          TIMESTAMPTZ,
  dmarc_policy        TEXT CHECK (dmarc_policy IN ('none', 'quarantine', 'reject')),
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (domain WITH =, valid_during WITH &&),  -- one handler at a time
  CHECK (provider <> 'panel' OR hosting_account_id IS NOT NULL)
);

CREATE TABLE mailboxes (                 -- side table: resources.kind = 'mailbox'
  resource_id         UUID PRIMARY KEY REFERENCES resources (id),
  mail_domain_id      UUID NOT NULL REFERENCES mail_domains (id),
  local_part          TEXT NOT NULL,
  quota_bytes         BIGINT,            -- null: unlimited within the account's disk
  protocols           TEXT[] NOT NULL DEFAULT '{imap,pop3,smtp,webmail}',
  hourly_recipient_limit INT,            -- the outbound cap, counted per recipient
  daily_recipient_limit  INT,
  spam_threshold      NUMERIC(4,1),      -- SpamAssassin score; lower is aggressive
  auto_delete_threshold NUMERIC(4,1),
  challenge_response  BOOLEAN NOT NULL DEFAULT false,
  password_changed_at TIMESTAMPTZ,       -- forced resets after a compromise show here
  UNIQUE (mail_domain_id, local_part),
  CHECK (auto_delete_threshold IS NULL OR auto_delete_threshold >= spam_threshold)
);

CREATE TABLE mail_forwarders (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  mail_domain_id      UUID NOT NULL REFERENCES mail_domains (id),
  local_part          TEXT NOT NULL,     -- '*' for a catch-all
  destination         TEXT NOT NULL,     -- an address or a mailbox
  srs                 BOOLEAN NOT NULL DEFAULT true,  -- rewrite the envelope so SPF passes
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE resold_mail_tenants (       -- the customer's tenant at Google or Microsoft
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  vendor              TEXT NOT NULL CHECK (vendor IN ('google_workspace', 'microsoft_365')),
  channel             TEXT NOT NULL CHECK (channel IN ('google_reseller', 'csp_direct_bill',
                        'csp_indirect')),
  distributor         TEXT,              -- for csp_indirect
  vendor_customer_id  TEXT NOT NULL,     -- Google customerId or Microsoft tenant id
  primary_domain      TEXT NOT NULL,
  subscription_id     UUID REFERENCES subscriptions (id),
  relationship        TEXT NOT NULL CHECK (relationship IN ('pending_transfer_in', 'active',
                        'transferred_out', 'ended')),
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (vendor WITH =, vendor_customer_id WITH =, valid_during WITH &&),
  CHECK ((channel = 'csp_indirect') = (distributor IS NOT NULL))
);

CREATE TABLE resold_seat_changes (       -- every seat or term change, with its commitment
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL REFERENCES resold_mail_tenants (id),
  vendor_sku          TEXT NOT NULL,     -- the vendor's product SKU
  vendor_plan         TEXT NOT NULL CHECK (vendor_plan IN ('annual_monthly_pay',
                        'annual_yearly_pay', 'flexible', 'trial', 'nce_monthly',
                        'nce_annual', 'nce_three_year')),
  seats_before        INT NOT NULL,
  seats_after         INT NOT NULL CHECK (seats_after >= 0),
  vendor_subscription_ref TEXT NOT NULL, -- not durable at Google; store each value seen
  committed_until     TIMESTAMPTZ,       -- the end of the term the seats are paid for
  cancellable_until   TIMESTAMPTZ,       -- e.g. seven days into an NCE term
  shown_to_customer_at TIMESTAMPTZ NOT NULL,  -- the commitment was disclosed first
  requested_by        TEXT NOT NULL,     -- typed actor
  effective_at        TIMESTAMPTZ NOT NULL
);
```

Outbound mail is metered like any usage: the relay emits one `usage_events` row per mailbox per minute with meter `mail.outbound_recipients` and dimensions for deferred and failed counts, which is what both the limit and the alarm read. Mailboxes over their hourly limit, or whose failure rate crosses the threshold, are the ones to pause:

```sql
SELECT m.resource_id, m.local_part || '@' || d.domain AS address,
       SUM(e.quantity) AS recipients_last_hour,
       SUM((e.dimensions ->> 'failed')::int + (e.dimensions ->> 'deferred')::int)
         ::numeric / NULLIF(SUM(e.quantity), 0) AS failure_rate
FROM mailboxes m
JOIN mail_domains d ON d.id = m.mail_domain_id
JOIN usage_events e ON e.resource_id = m.resource_id
                   AND e.meter = 'mail.outbound_recipients'
                   AND lower(e.occurred_during) >= NOW() - INTERVAL '1 hour'
GROUP BY m.resource_id, d.domain, m.local_part, m.hourly_recipient_limit
HAVING SUM(e.quantity) > m.hourly_recipient_limit
    OR SUM((e.dimensions ->> 'failed')::int + (e.dimensions ->> 'deferred')::int)
         ::numeric / NULLIF(SUM(e.quantity), 0) > 0.25;
```

Notes on the sketch:

- **A pause is a resource state, not an account hold.** The mailbox's `resources.state` moves to `suspended` for outbound, with the abuse case linked; the account and its sites keep running. An `account_holds` row comes only if the account itself is the problem.
- **DNS checks are timestamps, not booleans.** A record that was right yesterday and broken today is the common case after a customer changes DNS providers; the deliverability job rechecks on a schedule and notifies the customer with the exact record to fix.
- **One handler per domain at a time.** The exclusion constraint on `mail_domains` makes "the panel and Google both think they handle this domain" unrepresentable, which is the Email Routing mistake above.
- **Seat changes show the commitment first.** `shown_to_customer_at` is required, so a seat change can't be recorded without the term and cancellation window having been displayed.
- **Events:** `mailbox.outbound_paused`, `mailbox.password_reset_forced`, `mail_domain.dns_broken`, `resold_tenant.transferred_out` and `resold_seat.changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the abuse desk, notifications and billing.

## Auditing

- **Every outbound pause and its evidence:** the counts that triggered it, the abuse case, the reset and the release, because a mailbox owner who missed a day of sending will ask why.
- **Every DNS check result per domain,** so a deliverability complaint can be answered with when SPF, DKIM or MX last passed.
- **Every resold seat change,** with what was shown about the term and cancellation window, who asked, and the vendor's references, for the billing dispute that follows a mistaken annual seat.
- **Reseller relationship changes:** transfer tokens used, transfers in and out, and the dates, since a customer who moved resellers can still receive the old reseller's invoice.
- **Mailbox lifecycle:** creation, quota changes, deletion and the retention of the mail store after an account closes, which ties to backup retention in [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations#retention-and-placement).

## What This Means for the System You Build

- **Run mail off the web servers** once you have more than a handful; a compromised site shouldn't share a process, disk or IP with every mailbox.
- **Publish DKIM and SPF for every hosted domain automatically,** offer a DMARC record at setup, own the PTR, and recheck them on a schedule.
- **Count outbound by recipient, per mailbox and per hour,** and treat deferral and failure rates as the abuse alarm.
- **Keep one source of truth for who handles a domain's mail,** and make the server's routing follow it.
- **Say who runs pro email,** the renewal price and how to export mail.
- **Resell with the vendor's commitment rules in your billing:** terms, seat counts and cancellation windows shown before a change, vendor identifiers stored.
- **Include mail in every migration plan,** with the MX change and a repeat sync after it.

## References

**cPanel**

- [Exim Configuration Manager](https://docs.cpanel.net/whm/service-configuration/exim-configuration-manager/), Exim as cPanel's MTA
- [Exim Configuration Manager: Basic Editor](https://docs.cpanel.net/whm/service-configuration/exim-configuration-manager-basic-editor/), SpamAssassin threshold, DKIM verification, ARC, SRS, sender verification
- [Mailserver Configuration](https://docs.cpanel.net/whm/service-configuration/mailserver-configuration/), Dovecot IMAP and POP3, connection defaults, mdbox, webmail requires IMAP
- [cPanel deprecation plan](https://docs.cpanel.net/knowledge-base/cpanel-product/cpanel-deprecation-plan/), Horde removed for PHP 7.4 end of life, SquirrelMail removed, Roundcube
- [Tweak Settings: Mail](https://docs.cpanel.net/whm/server-configuration/tweak-settings/mail/), hourly limit per domain, failed or deferred percentage, trigger count, defaults
- [Add a Package](https://docs.cpanel.net/whm/packages/add-a-package/), email accounts, per-mailbox quota, mailing lists, hourly relay, failed or deferred percentage
- [Email Accounts](https://docs.cpanel.net/cpanel/email/email-accounts/), account limits set by the host, quotas
- [Spam Filters](https://docs.cpanel.net/cpanel/email/spam-filters/), SpamAssassin scoring, thresholds, auto-delete
- [BoxTrapper](https://docs.cpanel.net/cpanel/email/boxtrapper/), challenge-response verification
- [Email Routing](https://docs.cpanel.net/cpanel/email/email-routing/), local, backup, remote and automatic routing
- [Email Deliverability](https://docs.cpanel.net/cpanel/email/email-deliverability-in-cpanel/), DKIM, SPF and PTR checks
- [How to configure your firewall for cPanel services](https://docs.cpanel.net/knowledge-base/general-systems-administration/how-to-configure-your-firewall-for-cpanel-services/), mail and webmail ports

**Standards and history**

- [Sendmail, by Eric Allman](https://aosabook.org/en/v1/sendmail.html), delivermail and the start of sendmail
- [RFC 821: Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc821.html), August 1982
- [RFC 974: Mail Routing and the Domain System](https://www.rfc-editor.org/rfc/rfc974.html), January 1986, MX preference
- [RFC 1064: Interactive Mail Access Protocol, Version 2](https://www.rfc-editor.org/rfc/rfc1064.html), July 1988
- [Exim 3.20 overview](https://www.exim.org/exim-html-3.20/doc/html/oview.html), in service from the end of 1995, University of Cambridge
- [Exim](https://www.exim.org/), Philip Hazel as original author
- [RFC 1939: Post Office Protocol, Version 3](https://www.rfc-editor.org/rfc/rfc1939.html), May 1996
- [Postfix release announcement](https://diswww.mit.edu/menelaus.mit.edu/bt/8701), Wietse Venema, open source release 14 Dec 1998, formerly VMailer
- [Dovecot](https://www.dovecot.org/), first release 2002
- [RFC 3501: IMAP4rev1](https://www.rfc-editor.org/rfc/rfc3501.html), March 2003
- [RFC 5321: Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc5321.html), October 2008, obsoletes RFCs 821 and 974
- [RFC 6376: DKIM Signatures](https://www.rfc-editor.org/rfc/rfc6376.html), September 2011
- [RFC 7208: Sender Policy Framework](https://www.rfc-editor.org/rfc/rfc7208.html), April 2014, the 10-lookup limit
- [RFC 7489: DMARC](https://www.rfc-editor.org/info/rfc7489), March 2015, now obsolete
- [RFC 9051: IMAP4rev2](https://www.rfc-editor.org/rfc/rfc9051.html), August 2021
- [RFC 9989: DMARC](https://www.rfc-editor.org/rfc/rfc9989.html), May 2026, Standards Track, tree walk, `pct` removed
- [RFC 9990: DMARC Aggregate Reporting](https://www.rfc-editor.org/info/rfc9990), 2026
- [RFC 9991: DMARC Failure Reporting](https://www.rfc-editor.org/info/rfc9991), 2026
- [Google launches hosted communications services](https://googlepress.blogspot.com/2006/08/google-launches-hosted-communications_28.html), 28 Aug 2006, Google Apps for Your Domain
- [Introducing G Suite](https://workspace.google.com/blog/product-announcements/all-together-now-introducing-g-suite), 29 Sep 2016
- [Introducing Google Workspace](https://workspaceupdates.googleblog.com/2020/10/introducing-google-workspace.html), 6 Oct 2020
- [Microsoft launches Office 365 globally](https://news.microsoft.com/source/2011/06/28/microsoft-launches-office-365-globally/), 28 Jun 2011, markets and prices

**Receivers and clouds**

- [Gmail: email sender guidelines](https://support.google.com/a/answer/81126), requirements for all senders and for bulk senders, spam rate thresholds, 1 Feb 2024
- [DigitalOcean: why is SMTP blocked](https://docs.digitalocean.com/support/why-is-smtp-blocked/), ports 25, 465 and 587 blocked on Droplets
- [Amazon EC2: port 25](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-resource-limits.html), blocked to public addresses by default, removal on request
- [Google Compute Engine: sending email](https://docs.cloud.google.com/compute/docs/tutorials/sending-mail), destination port 25 blocked outside the VPC
- [Azure: outbound SMTP connectivity](https://learn.microsoft.com/en-us/azure/virtual-network/troubleshoot-outbound-smtp-connectivity), port 25 by subscription type, 587 unrestricted
- [Exchange Online limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits), mailbox sizes, recipient and message rate limits

**Resale programs**

- [Google Workspace Reseller API: prerequisites](https://developers.google.com/workspace/admin/reseller/v1/how-tos/prerequisites), authorized reseller, signed contract, Partner Sales Console
- [Reseller API: getting started](https://developers.google.com/workspace/admin/reseller/v1/get-start/getting-started), resources, subscriptions, non-durable subscription IDs
- [Reseller API: manage subscriptions](https://developers.google.com/workspace/admin/reseller/v1/how-tos/manage_subscriptions), plans, seats, trial, transfer token
- [Google Workspace pricing](https://workspace.google.com/pricing), Business Starter and Standard prices and storage
- [Microsoft: Cloud Solution Provider program](https://learn.microsoft.com/en-us/partner-center/enroll/csp-overview), indirect and direct-bill models, direct-bill requirements, Microsoft Customer Agreement
- [Microsoft: new commerce license-based offers](https://learn.microsoft.com/en-us/partner-center/customers/new-commerce-license-based), all license-based purchases on new commerce from 1 Sep 2024, terms
- [Microsoft: new commerce cancellation policy](https://learn.microsoft.com/en-us/partner-center/customers/new-commerce-cancellation-policy), seven-day window, prorated refund

**Hosts (as of October 2026)**

- [Bluehost: email DNS and services](https://www.bluehost.com/help/article/bh-email-dns-email-services), Professional Email powered by Titan, MX records
- [Bluehost: Professional Email](https://www.bluehost.com/help/article/bluehost-professional-email), plans, storage, intro and renewal prices
- [Bluehost: mailbox quota](https://www.bluehost.com/help/article/email-accounts-change-the-mailbox-size-quota), 100 MB per address on Starter
- [GoDaddy: compare Professional Email plans](https://www.godaddy.com/help/compare-professional-email-powered-by-titan-plans-42801), Titan, storage tiers, SMTP relays
- [GoDaddy: Professional Email limitations](https://www.godaddy.com/help/professional-email-account-limitations-31970), daily limits, recipients, message size
- [GoDaddy: Microsoft 365 storage](https://www.godaddy.com/help/what-is-the-storage-capacity-of-my-microsoft-365-email-plan-42189), mailbox sizes by plan
- [Hostinger: email parameters and limits](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/), storage and sending limits, free trial
- [Hostinger: Business Email](https://www.hostinger.com/business-email), prices and term
- [Hostinger: hosting plan limits](https://www.hostinger.com/support/6976044-parameters-and-limits-of-hosting-plans-in-hostinger/), mailboxes per plan, PHP mail limits
- [Hostinger: Titan Email limits](https://www.hostinger.com/support/5326155-parameters-and-limits-of-titan-email), Titan plans
- [IONOS: create an email address](https://www.ionos.com/office-solutions/create-an-email-address), IONOS Email, Exchange, Business Gmail
- [SiteGround: email acceptable use](https://www.siteground.com/kb/acceptable-use-sitegrounds-email-service), hourly limits, recipients
- [DreamHost: email](https://www.dreamhost.com/products/email/), Professional Email price, trial, unlimited email on higher plans
- [DreamHost: Professional Email plan](https://help.dreamhost.com/hc/en-us/articles/360024060072-Professional-Email-plan), 25 GB per address
- [DreamHost: SMTP quota limits](https://help.dreamhost.com/hc/en-us/articles/215730437-SMTP-quota-limits), recipients per hour
- [Namecheap: Private Email vs cPanel email](https://www.namecheap.com/support/knowledgebase/article.aspx/9193/2179/differences-between-namecheap-private-email-and-cpanel-email/), plans, 10 GB cPanel mail limit
- [Namecheap: Private Email sending limits](https://www.namecheap.com/support/knowledgebase/article.aspx/10719/2179/email-sending-and-usage-limits-for-private-email/), per-mailbox hourly limits
- [Namecheap: shared hosting email restrictions](https://www.namecheap.com/support/knowledgebase/article.aspx/133/22/do-you-have-any-restrictions-on-sending-out-emails/), hourly limits per domain by plan
- [Titan](https://titan.email/), partner brands
- [Hostinger: migrate a website](https://docs.hostinger.com/websites/migrate-website), email not part of website migration
- [Google Workspace: set up MX records](https://knowledge.workspace.google.com/admin/domains/set-up-mx-records-for-google-workspace), up to 72 hours
- [cPanel: Transfer Tool](https://docs.cpanel.net/whm/transfers/transfer-tool/), Live Transfer and MX
