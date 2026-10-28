+++
title = "Email Sending Platforms"
description = "Email sending providers from the inside: SES, SendGrid, Mailgun, Postmark and Resend; onboarding, shared and dedicated IPs, warmup, streams and pricing."
category = "Hosting & Cloud Industry"
order = 2186
part = "Communications Platforms"
tags = ["email", "esp", "deliverability", "ip-warmup", "multi-tenancy"]
+++

An email sending platform (an ESP, in the industry's shorthand) is the email version of a CPaaS. It accepts mail from its customers' applications by API or SMTP, signs it, sends it from IP addresses whose reputation it manages, processes the bounces and complaints that come back, and keeps a suppression list so the same bad address isn't mailed twice. The network it doesn't own is the mailbox providers: Gmail, Yahoo, Outlook.com and the rest decide what reaches the inbox, and they judge the ESP's IP addresses and its customers' domains by the behavior of everyone who sends through them. An ESP's product is therefore reputation, pooled and divided: shared IPs where good senders carry each other, dedicated IPs for those who can sustain their own, streams that keep marketing from spoiling receipts, and onboarding and enforcement that keep the worst senders out of the pool.

This chapter covers the platforms themselves: how the market formed, how the providers onboard and vet senders, shared versus dedicated IPs and warmup, streams and tenants, bounce and suppression handling, pricing, and how to model it. What mailbox providers require and how ESPs enforce those rules on their own customers is [Inbox Rules](/books/hosting-and-cloud/inbox-rules). SPF, DKIM, DMARC, one-click unsubscribe and per-tenant domains from the sender's side are the playbook's [Email: Authentication and Streams](/docs/architecture/notifications#email-authentication-and-streams) and [Multi-Tenant Senders](/docs/architecture/notifications#multi-tenant-senders); CAN-SPAM is [Email: CAN-SPAM](/docs/compliance/consumer-contact#email-can-spam). Mailboxes a host sells to its customers are Email Hosting in the Web Hosting part.

## How the Providers Do It

The five providers below cover the shapes of the market: a cloud primitive, a CPaaS's email arm, a messaging aggregator's, an application-email specialist and a developer-first newcomer. As of October 2026:

| Provider | Owner | Onboarding | Entry pricing | Dedicated IPs | Separation of traffic |
| --- | --- | --- | --- | --- | --- |
| **Amazon SES** | AWS | Sandbox per Region: verified recipients only, 200 messages per 24 hours, 1 per second; production access reviewed within 96 hours | $0.10 per 1,000 outbound | $24.95 per IP per month (standard, auto-warmed); managed dedicated IPs $15 per account per month plus $0.08 per 1,000 for the first 10 million | Tenants with automated reputation policies (since August 2025); tenant-level suppression lists (since June 2026) |
| **Twilio SendGrid** | Twilio | Free trial of 100 emails a day for 60 days | Essentials $19.95 a month; Pro $89.95 | One dedicated IP included with Pro; Trial and Essentials send from shared IP groups; more IPs as add-ons | Subuser management on Pro |
| **Mailgun** | Sinch (via Pathwire) | Free plan of 100 a day | Basic from $15 (10,000 a month), Foundation $35 (50,000), Scale $90 (100,000) | "Accessible at 50k volume and included at 100K+"; extra IPs $59 per IP per month | IP pools for different streams |
| **Postmark** | ActiveCampaign | Account approval before sending outside the customer's verified domains, "in less than 24 hours on weekdays" | Developer free for 100 a month; Basic $15, Pro $16.50, Platform $18 for 10,000 a month | From $50 per IP per month, only at 300,000 or more messages a month on Pro or higher | Message Streams: transactional and broadcast on separate IP pools, up to 10 streams per server |
| **Resend** | Independent (Y Combinator, 2023) | Free plan of 100 a day and 3,000 a month; all accounts start at 10 API requests a second | Pro $20 (50,000 a month) to Scale $1,150 (2.5 million) | $30 a month, for senders above 3,000 a day on Transactional Scale or Marketing Pro | Domains per plan: 3 (free), 10 (Pro), 1,000 (Scale) |

The common shape: new accounts start constrained (a sandbox, a review, a daily cap), small senders share IPs, larger senders can buy dedicated ones that must be warmed, transactional and marketing traffic can be separated, and every provider publishes bounce and complaint limits it enforces ([Inbox Rules](/books/hosting-and-cloud/inbox-rules#enforcing-on-your-own-customers)).

## How We Got Here

Email predates most of this volume. The sending business grew up in the gap between how simple SMTP is and how hard it became to get mail accepted:

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| August 1982 | RFC 821 defines SMTP | Mail between any two servers | No sender authentication: anyone can claim any From address |
| July 1998 | RFC 2369 defines `List-Unsubscribe` and the other list header fields | A machine-readable way to leave a list | Optional for decades |
| April 2006 and May 2007 | SPF (RFC 4408) and DKIM (RFC 4871) | Which servers may send for a domain, and signed messages | Every sending service must manage DNS records and keys for its customers' domains |
| July 2009 | SendGrid is incorporated | Email delivery as a developer service | Deliverability becomes a vendor's risk, shared with every other customer |
| 2010 | Postmark is in beta at Wildbit; Mailgun is founded (Y Combinator) | Transactional email as a product | More shared pools whose reputation each provider must protect |
| January 25, 2011 | Amazon SES launches in beta | Email as a cloud primitive priced per thousand | Price pressure on every ESP |
| August 28, 2012 | Rackspace agrees to acquire Mailgun | Email bundled with hosting | Spun out again on February 22, 2017, with $50 million led by Turn/River Capital |
| 2012 and February 2016 | Mailchimp launches Mandrill; in 2016 it becomes an add-on requiring a paid Mailchimp account | Transactional sending from a marketing company | Developers on free plans had to move within weeks, a lesson in platform dependency |
| March 2015 | DMARC (RFC 7489) | A domain's policy for failed authentication, and aggregate reports | Alignment between From and the authenticated domain |
| January 2017 | RFC 8058 one-click unsubscribe | Unsubscribe without a landing page | Required for bulk senders from 2024 |
| November 17, 2017 | SendGrid's IPO closes (NYSE: SEND, $16 a share) | Public capital for an ESP | Independence lasted until Twilio's offer the next year |
| February 1, 2019 | Twilio completes its acquisition of SendGrid | Email inside a CPaaS | Two reputation systems, texting and email, in one company |
| January 29 and September 30, 2021 | Mailgun and Mailjet become Pathwire under Thoma Bravo; Sinch agrees to buy Pathwire for $1.9 billion | Email for a messaging aggregator | Consolidation into messaging groups |
| April 28, 2021 | MessageBird agrees to buy SparkPost for $600 million | Email for another aggregator | Consolidation |
| May 3, 2022 | ActiveCampaign acquires Postmark | Application email for a marketing platform | Postmark's independence |
| November 2, 2022 | SES launches Virtual Deliverability Manager | Deliverability insight inside the cloud service | Priced per thousand on top of sending |
| January and June 2023 | Resend is incorporated, then opens to everyone | A developer-first newcomer | Another shared pool to build a reputation for |
| October 3, 2023 | Google announces sender requirements for Gmail from February 2024; Yahoo follows | Authentication and complaint limits become mandatory | ESPs enforce them on customers ([Inbox Rules](/books/hosting-and-cloud/inbox-rules)) |
| August 1, 2025 | SES adds tenants with automated reputation policies | Per-customer isolation inside one ESP account | Automatic pauses per tenant to manage |
| May 2026 | DMARC moves to the standards track as RFCs 9989 and 9990 (with failure reporting in RFC 9991), obsoleting RFC 7489 | DMARC as a Proposed Standard | Three documents where there was one |
| August 2026 | M3AAWG publishes version 4.0 of its Sender Best Common Practices | Updated industry expectations for ESPs and senders | Higher vetting expectations |

Ownership consolidated into messaging companies (Twilio, Sinch, Bird) and a marketing platform (ActiveCampaign), with SES as the low-price floor and newcomers competing on developer experience.

## Onboarding and Vetting

An ESP's reputation is the sum of its customers', so the first control is who gets to send at all. M3AAWG's Sender Best Common Practices (version 4.0, August 2026) puts it directly: "All ESPs must have some type of pre-send vetting process to proactively identify malicious senders before they mail and they must all have a post-send vetting process to monitor clients after they mail," with "extra diligence in vetting entities to be provisioned in a shared environment," where one sender's practices can "poison" the environment. Its older Vetting BCP (November 2011) lists what to check: the company's formation and history, its infrastructure and processes, its sending history and patterns, and how it collected its list.

The providers implement this as a constrained start:

- **SES** puts every new account in a sandbox per Region: it can send only to verified addresses or the mailbox simulator, 200 messages in 24 hours at 1 per second. A production request names the use (marketing or transactional) and acknowledges bounce and complaint handling, and AWS answers within 96 hours.
- **Postmark** reviews every account: until approved, "you won't be able to send to any email address outside the domains you've added to your account and verified," and link tracking waits for approval.
- **SendGrid** and **Resend** start with daily caps on free plans (100 a day), and Resend starts every account at 10 API requests a second.

The constraint is the point. A spammer who signs up gets a sandbox; a legitimate sender gets a review that costs a day.

## Shared and Dedicated IPs

Mailbox providers track reputation by IP address and by domain. On a shared pool, many senders' traffic is mixed, so a small sender inherits the pool's reputation, good or bad. A dedicated IP carries only one sender's traffic, so its reputation is that sender's alone, which is better for a large consistent sender and worse for a small or irregular one: a dedicated IP that sends a few thousand messages a week never builds enough history to be trusted.

That is why every provider gates dedicated IPs on volume:

| Provider | When a dedicated IP is offered, as of October 2026 | Price |
| --- | --- | --- |
| **Postmark** | "At least 300,000 messages a month," on Pro or higher | $50 per IP per month |
| **Mailgun** | Accessible at 50,000 a month, included at 100,000 and above | Extra IPs $59 per IP per month |
| **SendGrid** | One included with Pro; more as add-ons | Included / add-on |
| **Resend** | More than 3,000 a day, on Transactional Scale or Marketing Pro | $30 a month |
| **SES** | Any account | $24.95 per IP per month standard; or managed dedicated IPs at $15 per account per month plus per-message fees |

SES also accepts bring-your-own IP ranges at the dedicated IP rate, with a 256-address minimum. Its managed dedicated IPs move the decision of how many IPs a sender needs, and their warmup, to SES.

### Warmup

A new IP has no reputation, and mailbox providers throttle or reject large volumes from one. Warming it means sending a small, gradually increasing share of the sender's mail through it while the rest goes through IPs that already have a reputation. The providers automate it differently:

- **SES** warms standard dedicated IPs automatically by mixing them with its shared pool; "the warmup percentage steadily increases over 45 days, independently from your sending volume." After warmup it recommends about 1,000 emails a day per mailbox provider per IP to keep the reputation, and says mailbox providers take "around two weeks" to "up to six weeks" to trust a new IP.
- **SendGrid** runs a 41-day automated schedule with an hourly limit per IP: 20 messages an hour on day 0, 1,000 on day 12, about 64,000 on day 24 and over 19.6 million on day 41. "When it reaches the hourly limit, the warming IP address stops sending messages"; other IPs on the account continue, and with none available Twilio retries for 72 hours. After day 41, the IP leaves the automated schedule.
- **Mailgun** offers an optional staged schedule with hourly and daily caps (1,000 a day in the first stage) and will "rollover your additional volume to shared IPs or other dedicated IPs tied to your domain."
- **Postmark** sends overflow beyond the daily limit "over our high quality shared IP pool."
- **Resend** distributes traffic "across shared and dedicated IPs" during warmup.

The shared idea is that overflow goes somewhere with a reputation. A platform that warms by queueing overflow instead delays its customers' mail by days; one that warms by sending everything through the new IP gets it throttled.

## Streams and Tenants

Separating traffic by type and by customer is the other half of reputation management, and the providers offer both.

**By type.** Postmark's Message Streams put transactional and broadcast mail on separate IP pools ("never mix, including IP ranges"), up to ten streams per server, and require an unsubscribe link on broadcast only. Mailgun's IP pools group dedicated IPs "for different mail sending streams." The playbook explains why a sender separates them ([Email: Authentication and Streams](/docs/architecture/notifications#email-authentication-and-streams)); the ESP's job is to make the separation real at the IP and suppression level, so a marketing complaint never suppresses a password reset.

**By customer.** A platform that sends for its own customers needs each customer isolated, and ESPs have added tenancy for that:

- **SES tenants** (August 1, 2025) let one AWS account divide its sending into tenants with automated reputation policies: "Standard (recommended) which pauses sending for high-impact findings," "Strict which pauses for any reputation finding," or "None for manual monitoring." From June 1, 2026 "each tenant maintains a separate suppression list," and from September 17, 2026 Virtual Deliverability Manager reports deliverability per tenant.
- **Postmark** recommends that a platform "set up each customer on their own Server," and says "using a single sending domain for multiple customers is a big no-no," asking for past stats with "a bounce rate below 10% and a spam complaint of 0.1% or lower" before onboarding a customer.
- **SendGrid** includes subuser management on its Pro plan.

## Bounces, Blocks and Suppression

What comes back from a mailbox provider falls into three classes, and an ESP that collapses them into two makes mistakes:

| Outcome | What it means | What the ESP does |
| --- | --- | --- |
| **Hard bounce** | The address doesn't exist or will never accept mail (an SMTP 5yz for the recipient) | Suppress the address for the sender; count toward the bounce rate |
| **Soft bounce** | A temporary problem (mailbox full, server busy, a 4yz deferral) | Retry with backoff; suppress after repeated failures |
| **Block** | The receiver refused the sender, not the recipient: an authentication failure, a reputation block, a policy rejection | Don't suppress the address; fix the sender, the IP or the domain |

SendGrid's handling of Outlook's `550 5.7.515` (an authentication-level rejection) shows the third class: it treats it as a block, so the recipient isn't suppressed, because the fault is the sender's authentication. SES counts toward its bounce rate only hard bounces to domains the sender hasn't verified.

Suppression lists then have scopes: per sender (the customer's own unsubscribes and hard bounces), per tenant (SES since June 2026), per stream (a marketing unsubscribe doesn't stop receipts), and platform-wide for addresses that are invalid for everyone. The playbook's rule for senders is that the ESP is a backstop and the application's consent ledger is the system of record ([Providers and Their Errors](/docs/architecture/notifications#providers-and-their-errors)); the ESP's rule is to never send to a suppressed address, whatever the API call says, and to tell the customer why by event.

## Pricing

Email prices per thousand messages, by plan tier, and the gap between the cloud primitive and the managed services is large:

| Provider | Price shape, as of October 2026 |
| --- | --- |
| **Amazon SES** | $0.10 per 1,000 outbound (plan rates $0.11 to $0.23); inbound $0.10 per 1,000; attachments $0.12 per GB; Virtual Deliverability Manager $0.07 per 1,000 for the first 10 million |
| **SendGrid** | Essentials $19.95 a month, Pro $89.95, Premier custom |
| **Mailgun** | Basic from $15 for 10,000 ($1.80 per extra 1,000), Foundation $35 for 50,000, Scale $90 for 100,000 ($1.10 per extra 1,000) |
| **Postmark** | Basic $15, Pro $16.50, Platform $18 for 10,000 a month; $1.80, $1.30 or $1.20 per extra 1,000 |
| **Resend** | Free to Pro ($20 for 50,000) to Scale ($1,150 for 2.5 million); overage $0.90 to $0.46 per 1,000; a hard limit of five times the monthly quota |

What the managed services charge for, beyond the messages, is the reputation work: onboarding review, warmup, streams, suppression, deliverability tooling and support.

## The Alternatives

A company that needs to send email, or wants to sell email sending, chooses among:

| Option | Model | Strengths | Failure modes | Who uses it |
| --- | --- | --- | --- | --- |
| **Cloud primitive (SES)** | Pay per thousand; build the rest | Lowest price; tenants and VDM now built in | Bounce handling, suppression, templates and monitoring are the customer's work; account-level pauses don't emit events (poll `GetAccount`) | High-volume senders with engineering capacity; platforms building their own ESP layer |
| **Developer ESP (Postmark, Resend, Mailgun, SendGrid)** | Plans by volume, managed reputation | Fast to integrate; onboarding, warmup, streams and suppression done | Higher unit price; the provider's enforcement can pause a whole account | Most applications |
| **Marketing platform** | Campaign tools with sending included | Editors, lists, segmentation | Transactional mail mixed with campaigns unless separated; vendor lock-in (Mandrill in 2016) | Marketing teams |
| **Self-hosted MTA** | Run Postfix or a commercial MTA on owned IPs | Full control and lowest marginal cost at scale | IP reputation, warmup, feedback loops, blocklist removals and abuse handling are all yours | Large ESPs themselves; very large senders |

My default for an application is a developer ESP with separate streams for transactional and marketing mail, shared IPs until volume justifies a dedicated one by the provider's own threshold, and the application's own consent ledger and suppression on top. For a platform sending on behalf of its customers, I'd use one ESP tenant or server per customer from the start (SES tenants or Postmark servers), each on the customer's authenticated domain, because retrofitting isolation after one customer gets the whole account paused is the expensive way to learn it.

## How to Build It

The chapter adds IP pools, streams, email events, suppressions and warmups to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). A customer's sending domain is a `sender_identities` row of channel `email_domain` with an `email_domain` identifier; a dedicated IP is a `resources` row of kind `ip_address` with an `ipv4` identifier, held for a range like any address, so a blocklist report against it resolves to the customer that held it.

```sql
CREATE TABLE ip_pools (                  -- a set of sending IPs with one reputation strategy
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID REFERENCES accounts (id),   -- null: a platform shared pool
  name          TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('shared', 'dedicated', 'managed_dedicated',
                  'byoip')),
  traffic_class TEXT NOT NULL CHECK (traffic_class IN ('transactional', 'broadcast',
                  'mixed')),
  risk_tier     TEXT CHECK (risk_tier IN ('trusted', 'standard', 'new', 'quarantine')),
                                         -- shared pools: where a sender is placed
  CHECK ((kind = 'shared') = (account_id IS NULL))
);

CREATE TABLE ip_pool_members (
  pool_id       UUID NOT NULL REFERENCES ip_pools (id),
  ip_resource_id UUID NOT NULL REFERENCES resources (id),  -- kind = 'ip_address'
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (ip_resource_id WITH =, valid_during WITH &&)  -- one pool at a time
);

CREATE TABLE ip_warmups (                -- a dedicated IP's ramp
  ip_resource_id UUID PRIMARY KEY REFERENCES resources (id),
  schedule      TEXT NOT NULL,           -- 'auto_45d', 'hourly_41d', 'custom'
  started_at    TIMESTAMPTZ NOT NULL,
  day           SMALLINT NOT NULL DEFAULT 0,
  overflow_pool_id UUID REFERENCES ip_pools (id),  -- where volume above the cap goes
  completed_at  TIMESTAMPTZ
);

CREATE TABLE email_streams (             -- a sender's traffic class with its own pool and suppressions
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  tenant_ref      TEXT,                  -- the customer's own tenant, for platforms
  domain_id       UUID NOT NULL REFERENCES resources (id),  -- sender_identity, channel 'email_domain'
  traffic_class   TEXT NOT NULL CHECK (traffic_class IN ('transactional', 'broadcast')),
  pool_id         UUID NOT NULL REFERENCES ip_pools (id),
  require_unsubscribe BOOLEAN NOT NULL,  -- true for broadcast
  status          TEXT NOT NULL CHECK (status IN ('active', 'paused', 'closed')),
  UNIQUE (account_id, tenant_ref, domain_id, traffic_class)
);

CREATE TABLE email_events (              -- append-only; partitioned by month
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  stream_id       UUID NOT NULL REFERENCES email_streams (id),
  message_id      TEXT NOT NULL,         -- the platform's id, also in a header
  recipient       TEXT NOT NULL,         -- normalized address
  recipient_domain TEXT NOT NULL,        -- for per-mailbox-provider rates
  ip_resource_id  UUID REFERENCES resources (id),
  event           TEXT NOT NULL CHECK (event IN ('accepted', 'sent', 'delivered',
                    'deferred', 'bounced_hard', 'bounced_soft', 'blocked', 'complained',
                    'unsubscribed', 'suppressed', 'opened', 'clicked')),
  smtp_code       TEXT,                  -- e.g. '550 5.7.515'
  smtp_detail     TEXT,
  feedback_source TEXT,                  -- a feedback loop, for complaints
  occurred_at     TIMESTAMPTZ NOT NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_suppressions (        -- never send, whatever the API call says
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  scope           TEXT NOT NULL CHECK (scope IN ('platform', 'account', 'tenant', 'stream')),
  account_id      UUID REFERENCES accounts (id),
  tenant_ref      TEXT,
  stream_id       UUID REFERENCES email_streams (id),
  recipient       TEXT NOT NULL,
  reason          TEXT NOT NULL CHECK (reason IN ('hard_bounce', 'complaint', 'unsubscribe',
                    'repeated_soft_bounce', 'manual', 'invalid')),
  source_event_id UUID REFERENCES email_events (id),
  valid_during    TSTZRANGE NOT NULL,
  CHECK (scope = 'platform' OR account_id IS NOT NULL)
);
```

Each accepted message emits a usage event on `email.messages` (with stream, traffic class and attachment bytes as dimensions), rated against plan allowances and overage SKUs. Dedicated IPs and managed IP fees are recurring SKUs on the IP resource.

Notes on the sketch:

- **Blocks are a third outcome.** `blocked` is its own event and never creates a suppression; a burst of blocks on one IP or domain is a sender problem routed to [Inbox Rules](/books/hosting-and-cloud/inbox-rules#how-to-build-it)'s enforcement.
- **Suppression is checked at send time, by scope,** from the most general (platform-invalid addresses) to the most specific (this stream's unsubscribes). A broadcast unsubscribe suppresses the broadcast stream only.
- **Shared pools are tiered.** New senders start in a `new` pool, proven senders move to `trusted`, and a sender under review moves to `quarantine`, so one sender's problem stays in its tier. Placement is a dated change with a reason, recorded as `ip_pool_members` history for IPs and as stream-to-pool changes for senders.
- **IPs are held identifiers,** so "who sent from 198.51.100.24 on this date" resolves through `resource_identifiers` for blocklist removals and abuse reports.
- **Warmup is state, not configuration.** The day counter and overflow pool decide routing; finishing warmup is an event that changes the stream's routing.
- **Events:** `email.delivered`, `email.bounced`, `email.blocked`, `email.complained`, `email.suppressed`, `ip.warmup_completed` and `stream.paused` go to customer webhooks, the reputation pipeline and the abuse desk through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Every message's events,** with the IP and stream that carried it, for disputes and for proving a suppression was honored.
- **Every suppression** with the event that caused it, kept as long as a complaint could reach it.
- **Which IPs belonged to which pool and which customer, when,** for blocklist and abuse reports.
- **Onboarding decisions:** what was reviewed, by whom, and why a sender was approved or moved between pools.
- **Pauses and their reasons** ([Inbox Rules](/books/hosting-and-cloud/inbox-rules#auditing)).

## What This Means for the System You Build

- **Start every new sender constrained,** with a sandbox or review, and vet before and after the first send, as M3AAWG expects.
- **Keep small senders on shared, tiered pools** and offer dedicated IPs only above a volume where they can hold a reputation.
- **Warm new IPs with overflow to a reputable pool,** never by delaying the customer's mail.
- **Separate transactional and broadcast traffic** at the IP pool and the suppression list.
- **Isolate each customer** of a platform as its own tenant or server on its own domain.
- **Treat blocks as a third outcome,** distinct from hard and soft bounces, and never suppress an address because the sender failed authentication.
- **Hold IPs as identifiers over time,** so reputation reports resolve to the sender that caused them.

## References

**Standards and industry guidance**

- [RFC 821: Simple Mail Transfer Protocol](https://www.rfc-editor.org/info/rfc821), August 1982
- [RFC 5321: Simple Mail Transfer Protocol](https://www.rfc-editor.org/info/rfc5321), October 2008
- [RFC 2369: List header fields](https://www.rfc-editor.org/info/rfc2369), July 1998
- [RFC 4408: SPF](https://www.rfc-editor.org/info/rfc4408), April 2006, obsoleted by RFC 7208
- [RFC 4871: DKIM](https://www.rfc-editor.org/info/rfc4871), May 2007, obsoleted by RFC 6376
- [RFC 7489: DMARC](https://www.rfc-editor.org/info/rfc7489), March 2015, obsoleted by RFCs 9989, 9990 and 9991
- [RFC 9989: DMARC](https://datatracker.ietf.org/doc/rfc9989/), Proposed Standard, May 2026
- [RFC 9990: DMARC Aggregate Reporting](https://datatracker.ietf.org/doc/rfc9990/), Proposed Standard, May 2026
- [RFC 9991: DMARC Failure Reporting](https://www.rfc-editor.org/info/rfc9991), obsoleting RFC 7489
- [RFC 8058: One-click unsubscribe](https://www.rfc-editor.org/info/rfc8058), January 2017
- [M3AAWG: Sender Best Common Practices, version 4.0 (PDF)](https://www.m3aawg.org/sites/default/files/doc_files/m3aawg-sender-best-common-practices-aug-27-2026.pdf), pre-send and post-send vetting, shared environments
- [M3AAWG: Vetting Best Common Practices](https://www.m3aawg.org/documents/en/maawg-vetting-best-common-practices-bcp), what an ESP checks about a new sender

**Provider documentation and pricing**

- [Amazon SES: Pricing](https://aws.amazon.com/ses/pricing/), per-message, dedicated IP, managed IP, BYOIP and VDM prices
- [Amazon SES: Request production access](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html), sandbox limits and review
- [Amazon SES: Dedicated IP warming](https://docs.aws.amazon.com/ses/latest/dg/dedicated-ip-warming.html), the 45-day automatic warmup and post-warmup volume
- [Amazon SES: Enforcement FAQ](https://docs.aws.amazon.com/ses/latest/dg/faqs-enforcement.html), bounce counting and account pauses without events
- [AWS: Introducing Amazon SES (beta)](https://aws.amazon.com/about-aws/whats-new/2011/01/25/introducing-amazon-simple-email-service-beta), January 25, 2011
- [AWS: SES Virtual Deliverability Manager](https://aws.amazon.com/about-aws/whats-new/2022/11/amazon-simple-email-service-virtual-deliverability-manager-delivery-rate/), November 2, 2022
- [AWS: SES tenant isolation with automated reputation policies](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-ses-tenant-isolation-automated-reputation-policies/), August 1, 2025
- [AWS: SES tenant-level suppression lists](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-ses-tenant-level-suppression-lists/), June 1, 2026
- [AWS: SES VDM for tenants](https://aws.amazon.com/about-aws/whats-new/2026/09/amazon-ses-vdm-tenants/), September 17, 2026
- [Twilio SendGrid: Email API pricing](https://www.twilio.com/en-us/products/email-api/pricing), plans, free trial and dedicated IPs
- [Twilio SendGrid: Dedicated IP addresses](https://www.twilio.com/docs/sendgrid/ui/account-and-settings/dedicated-ip-addresses), one IP with Pro and shared IPs for Trial and Essentials
- [Twilio SendGrid: Warming up an IP address](https://www.twilio.com/docs/sendgrid/ui/sending-email/warming-up-an-ip-address), the 41-day hourly schedule and overflow behavior
- [Twilio: Outlook's new email sender requirements](https://www.twilio.com/en-us/blog/insights/outlook-new-email-sender-requirements), 5.7.515 treated as a block
- [Mailgun: Pricing](https://www.mailgun.com/pricing/), plans and dedicated IPs
- [Mailgun: IP warm-up](https://www.mailgun.com/blog/product/ip-warm-up/), staged schedule and rollover
- [Mailgun: IP pools](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/ip-pools), pools for sending streams
- [Postmark: Message Streams](https://postmarkapp.com/message-streams), transactional and broadcast on separate IP pools
- [Postmark: Pricing](https://postmarkapp.com/pricing), plans and dedicated IP eligibility
- [Postmark: Dedicated IPs](https://postmarkapp.com/dedicated-ips), 300,000 a month, $50 per IP, overflow to shared pools
- [Postmark: Account approval process](https://postmarkapp.com/support/article/1084-how-does-the-account-approval-process-work), sending limits before approval and review time
- [Postmark: Vetting and setting up new customers](https://postmarkapp.com/guides/how-to-vet-and-set-up-new-customers-for-sending-through-postmark), a server per customer and past-stat thresholds
- [Resend: Pricing](https://resend.com/pricing), plans, dedicated IP add-on and free limits
- [Resend: Dedicated IPs](https://resend.com/docs/knowledge-base/how-do-dedicated-ips-work), eligibility and warmup split
- [Resend: Account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits), quotas, domains, the hard limit and the request rate

**Company history**

- [SendGrid: Form S-1](https://www.sec.gov/Archives/edgar/data/0001477425/000104746917006437/a2233508zs-1.htm), incorporated in July 2009
- [SendGrid: IPO prospectus (424B4)](https://www.sec.gov/Archives/edgar/data/1477425/000104746917007093/a2233849z424b4.htm), $16 a share on the NYSE, delivery on November 17, 2017
- [Twilio: SendGrid acquisition completed (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1447669/000110465919005275/a19-3826_1ex99d1.htm), February 1, 2019
- [Wildbit: A great 2009 and an even better 2010](https://wildbit.com/blog/a-great-2009-and-even-better-2010), Postmark in beta
- [Wildbit: Postmark has been acquired by ActiveCampaign](https://wildbit.com/blog/postmark-has-been-acquired-by-activecampaign), May 3, 2022
- [451 Research: Rackspace acquires Mailgun](https://blogs.451research.com/investment-banking/rackspace-acquires-mailgun-in-appeal-to-hosted-app-developers/index.html), founded in 2010, Y Combinator
- [Mailgun: Mailgun is being acquired by Rackspace](https://www.mailgun.com/blog/company/mailgun-is-being-acquired-by-rackspace/), August 28, 2012
- [TechCrunch: Mailgun, there and back again](https://techcrunch.com/2017/02/22/mailgun-there-and-back-again), the February 22, 2017 spin-out
- [SiliconANGLE: Mailgun spins out of Rackspace and raises $50M](https://siliconangle.com/2017/02/24/email-automation-service-mailgun-spins-rackspace-raises-50m-financing/), Turn/River Capital
- [Mailgun: Introducing Pathwire](https://www.mailgun.com/blog/introducing-pathwire/), January 29, 2021, under Thoma Bravo
- [TechCrunch: Sinch acquires Pathwire](https://techcrunch.com/2021/09/30/sinch-acquires-pathwire-the-company-behind-mailgun-and-mailjet-for-1-9b-to-add-email-into-its-api-based-communications-platform), $1.9 billion
- [CMSWire: Mailchimp's Mandrill move](https://www.cmswire.com/digital-marketing/mailchimps-mandrill-move-enrages-email-users/), Mandrill launched in 2012 and made a paid add-on
- [The Next Web: Mandrill gives developers 60 days to switch](https://www.thenextweb.com/news/in-hostile-move-mandrill-gives-all-developers-60-days-to-switch-to-paid-mailchimp-service), the February 2016 change
- [VentureBeat: MessageBird acquires SparkPost](https://venturebeat.com/business/messagebird-acquires-email-data-platform-sparkpost-closes-1b-round), $600 million, April 28, 2021
- [Y Combinator: Resend](https://www.ycombinator.com/companies/resend), founded 2023, Winter 2023 batch
- [Resend: How we got here](https://resend.com/handbook/company/how-we-got-here), incorporated January 2023, opened to everyone in June 2023
- [Google: New Gmail protections for a safer, less spammy inbox](https://blog.google/products/gmail/gmail-security-authentication-spam-protection/), the October 3, 2023 announcement
