+++
title = "Telecom Fraud"
description = "Fraud a communications platform carries: SMS pumping, international revenue share and toll fraud, the platform as a target, geo permissions, and who pays."
category = "Hosting & Cloud Industry"
order = 2186
part = "Communications Platforms"
tags = ["fraud", "sms-pumping", "toll-fraud", "irsf", "geo-permissions"]
+++

Most fraud against a cloud steals compute; telecom fraud steals money directly, through the platform's own billing. A fraudster who can make a platform send texts or place calls to numbers that pay per message or per minute earns a share of every one, and the bill goes to the platform's customer, who then asks the platform to forgive it. The two classic forms are SMS pumping, where bots trigger one-time passcodes or app links to blocks of numbers on a small carrier that shares the termination revenue, and international revenue share fraud, where calls are pumped to premium or high-cost numbers abroad. Both look like ordinary usage until the invoice arrives. A third form treats the platform itself as the target: the accounts, staff and admin tools that control thousands of customers' numbers.

This chapter covers telecom fraud from the platform's side: how the problem grew, how SMS pumping and toll fraud work and what stops them, the platform as a target, the controls the providers ship (geo permissions, prefix blocking, conversion monitoring), who pays, and how to model the controls. Stolen API keys and free-tier abuse across the whole provider are [Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#stolen-keys) in the Abuse, Trust and the Law part; carrier fines for customers' content are in [Sending a Text](/books/hosting-and-cloud/sending-a-text#filtering-and-carrier-fines).

## How the Providers Do It

The public controls converge on three ideas: don't send where the customer doesn't do business, block destinations that behave like fraud, and watch whether verifications complete. As of October 2026:

| Provider | Messaging controls | Voice controls | Published stance on cost |
| --- | --- | --- | --- |
| **Twilio** | Verify Fraud Guard analyzes "historical SMS traffic for unusual patterns" and "blocks the prefix of the destination of the suspected fraud," at Basic, Standard (default) or Max; Geo Permissions per country with immediate effect; a Safe List never blocked; SMS Pumping Protection; Lookup line type intelligence | Voice dialing geographic permissions per country, high-risk number ranges "updated multiple times a month" and not disclosed, special-services ranges (premium, shared-cost) blocked | After an August 2026 pumping spike, changed the Verify default for Italy and Argentina to "Monitor all traffic for fraud"; accounts that revert it bear the cost |
| **Bandwidth** | Orchestration with third-party fraud tools (Maestro) | Not captured | Not captured |
| **Telnyx, Plivo, Sinch, Vonage** | Country permissions and fraud tooling | Destination permissions | Not captured |

The shape most providers share: country permissions default narrow for new accounts, a verification product that adds fraud detection on top of raw SMS, and a shared list of risky destinations the platform maintains across all customers.

## How It Got Here

Toll fraud is as old as long distance billing; each shift in who could originate traffic moved who it hit:

| Date | Step | What it showed | What it cost |
| --- | --- | --- | --- |
| Before October 2001 | Hackers dial into business PBXs and place long distance calls through them; the FCC upholds carriers' tariffs that make the customer liable (*Chartways*, affirmed in *Gerri Murphy Realty v. AT&T*, October 2001) | The party whose equipment was compromised pays | Carriers sold capped-liability protection: AT&T's default plan capped liability at $25,000 before the customer notified AT&T |
| 2010s | Calls and texts originate from software; premium and high-cost destinations become revenue for anyone who can trigger traffic | Fraud moves from hacked PBXs to stolen API credentials and abused sign-up forms | Usage bills arrive before anyone notices |
| June to August 2022 | Twilio staff are vished, then smished with fake login pages; attackers use internal admin tools and reach 209 customers (of more than 270,000) and 93 Authy users | The platform's own staff and tools are a target | FIDO2 security keys for all staff |
| December 20, 2022 | Elon Musk says Twitter lost about $60 million a year (outside North America) to 390 telcos pumping two-factor SMS through bot accounts | SMS pumping at scale, against one of the largest OTP senders | Twitter restricts SMS two-factor authentication to Twitter Blue subscribers from March 20, 2023 |
| July 1, 2024 | Twilio discloses that an unauthenticated endpoint let attackers identify phone numbers tied to Authy accounts | Enumeration through a verification product | Endpoint secured and apps updated |
| 2023 and 2025 | CFCA's surveys estimate global telecom fraud losses of $38.95 billion (2023) and $41.82 billion (2025), as reported by TNS | An industry-wide loss | Fraud controls become part of every CPaaS product |
| August 19, 2026 | Twilio changes Verify's default for Italy and Argentina to monitored after a pumping spike | Defaults decide exposure | Customers who opt out own the risk |

The lesson running through the table is that the fraud follows whatever can be triggered cheaply and billed expensively, and that the dispute is always about who should have stopped it.

## SMS Pumping

SMS pumping (also called artificially inflated traffic, AIT) abuses any form that sends a text to a phone number the visitor types: sign-up verification, password reset, "text me the app link." Twilio's description of the scheme: fraudsters use those fields to send messages to blocks of numbers on a mobile network operator and take a revenue share of the termination fees, with small operators complicit or unwitting. The platform's customer pays for every message; the platform pays the termination fee to the carrier chain; the fraudster is paid by someone in that chain.

The signals are distinctive once looked for:

- **Spikes to sequential or adjacent numbers** in one country or on one network.
- **Verifications that never complete:** codes sent, never entered. A legitimate sign-up flow converts a high share of its codes; a pumped one converts almost none.
- **Unusual countries** for the customer's business, especially ones with high termination rates.
- **Bursts from few sources** that rotate IPs or devices.

The defenses, in the order I'd apply them:

1. **Country allowlists.** Send only to countries the customer serves. Twilio's Geo Permissions take effect immediately; a new account on any platform should start with the home country only.
2. **Destination prefix blocking.** Block number ranges that show fraud patterns across all customers. Fraud Guard blocks "the prefix of the destination of the suspected fraud" from historical anomalies, with levels that trade false positives against losses.
3. **Conversion monitoring.** Track sent versus verified per country and prefix; when conversion falls, throttle or block that destination for that customer.
4. **Rate limits per destination and per form,** at the customer's application and at the platform.
5. **Line type and carrier lookups** before sending a code, to refuse destinations that aren't mobile numbers where mobile is expected.
6. **A safe list** for numbers the customer knows are good, exempt from automatic blocks.

What doesn't work is relying on the customer's application alone: the customer's form is the attack surface, and the customer usually learns of the attack from the platform's invoice.

## Toll Fraud and International Revenue Share

International revenue share fraud (IRSF) is the voice equivalent. Fraudsters obtain international premium or high-cost numbers whose operators pay per minute, then generate calls to them through compromised accounts, hacked phone systems, open SIP trunks or abused click-to-call features. Twilio puts the industry's losses at "$10 billion in industry-wide revenue losses annually" across more than 200 countries (a vendor figure). The calls are long, often simultaneous, and frequently outside business hours, when nobody is watching.

The controls mirror messaging's:

- **Per-country dialing permissions,** defaulting to the home country and off for high-risk regions.
- **High-risk number ranges,** maintained by the platform across all customers. Twilio updates its list "multiple times a month" and doesn't disclose it, because a published list tells fraudsters which ranges are still open.
- **Special-services blocks** for premium-rate and shared-cost numbers by default.
- **Spend and concurrency limits:** caps on simultaneous international calls and on hourly international spend per account, with alerts.
- **Trunk security:** credentials and IP allowlists on SIP trunks ([Voice Platforms](/books/hosting-and-cloud/voice-platforms#sip-trunking)), because an open trunk is an open wallet.

## The Platform as a Target

A CPaaS holds the numbers, credentials and message streams of thousands of companies, which makes its staff and admin tools a target in their own right. Twilio's August 2022 incident is the public case: employees received texts pointing to fake login pages, attackers used the stolen credentials to reach internal admin tools, and data of 209 customers and 93 Authy users was accessed; Twilio linked it to a June 29, 2022 voice phishing incident and moved all staff to FIDO2 keys. Its July 2024 Authy disclosure showed the other surface: an unauthenticated endpoint that let attackers confirm which phone numbers had Authy accounts.

The defenses are the provider-wide ones in this volume ([Identity, IAM and API Keys](/books/hosting-and-cloud/accounts-and-resellers#identity-iam-and-api-keys)): phishing-resistant authentication for staff, scoped and audited admin tools, rate limits and authentication on every endpoint that confirms whether a number or account exists, and leak detection for customers' API keys. A stolen customer key is how most pumping and toll fraud begins on an account that didn't build a vulnerable form.

## Who Pays

The tariff-era answer was clear: under AT&T's tariffs, the FCC held a customer "liable for unauthorized calls" made through its own phone system, and the carrier sold protection plans that capped that liability. The CPaaS-era answer is mostly contractual, and the providers' terms put the usage on the customer: traffic generated with the customer's credentials, through the customer's form or trunk, is the customer's bill. Twilio's August 2026 change states the principle in product form: the safer default is on, and an account that turns it off "bears the cost."

In practice, the cost lands in three places, and the platform's design decides the split:

| Who | What they lose | What reduces it |
| --- | --- | --- |
| **The customer** | Every message and minute billed | Narrow geo permissions, rate limits on forms, conversion monitoring, spend alerts |
| **The platform** | Termination fees it can't collect, bill forgiveness, and support load | Prefix blocking across customers, default-narrow permissions, fast detection |
| **The carrier chain** | Fees disputed upstream | Carrier-level fraud programs |

My position is that the platform should make the safe configuration the default and the loss visible within minutes, because a customer who finds out from a five-figure invoice will dispute it, and a platform that could have stopped it often ends up absorbing it. Forgiveness policy belongs with the provider's broader bill-forgiveness rules ([Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills#surprise-bills-and-forgiveness) in the Metering and Billing part).

## The Alternatives

| Control | What it stops | Strengths | Failure modes |
| --- | --- | --- | --- |
| **Country allowlist** | Pumping and IRSF to countries the customer doesn't serve | Cheap, effective, immediate | Customers with global users need many countries open, which reopens the risk |
| **Prefix blocklist across customers** | Known fraud ranges | Learns from every customer's attacks | False positives block real users; lists must stay secret and current |
| **Conversion monitoring** | Pumping that hides in allowed countries | Detects new attacks without a list | Needs the verification outcome, which only a verify product or the customer's callback provides |
| **Spend and velocity caps** | Runaway bills of any kind | Bounds the worst case | A cap set too low stops a legitimate launch |
| **A verification product instead of raw SMS** | Pumping on OTP flows | Fraud detection and conversion data built in | Priced per verification; moves trust to the platform |
| **Dropping SMS for the factor** | Pumping entirely | Removes the attack | Users without other factors lose access (Twitter limited SMS 2FA to paid accounts) |

My default for a platform is all of the first four on every account, with new accounts limited to their home country until they ask for more, a verification product offered for every OTP use, and international voice off by default with per-account concurrency and hourly spend caps.

## How to Build It

The chapter adds geo permissions and fraud blocks to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Spend caps use the core `quotas` table with `source = 'risk'` (for example `quota_code = 'voice.international.concurrent'` or `'sms.international.hourly_spend'`), so a fraud response is a dated quota change, not a code path.

```sql
CREATE TABLE geo_permissions (           -- where an account or project may send or call
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  project_id    UUID REFERENCES projects (id),   -- null: account-wide
  channel       TEXT NOT NULL CHECK (channel IN ('sms', 'voice', 'verify')),
  country       CHAR(2) NOT NULL,
  mode          TEXT NOT NULL CHECK (mode IN ('allow', 'block', 'monitor')),
  high_risk_ok  BOOLEAN NOT NULL DEFAULT FALSE,  -- voice: high-cost ranges in this country
  set_by        TEXT NOT NULL,           -- typed actor: 'customer:<user>', 'system:default'
  acknowledged_risk BOOLEAN NOT NULL DEFAULT FALSE,  -- the customer overrode a safer default
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (account_id WITH =, (COALESCE(project_id::text, '')) WITH =,
    channel WITH =, country WITH =, valid_during WITH &&)
);

CREATE TABLE fraud_blocks (              -- destinations blocked by the platform
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  scope         TEXT NOT NULL CHECK (scope IN ('platform', 'account')),
  account_id    UUID REFERENCES accounts (id),   -- set when scope = 'account'
  channel       TEXT NOT NULL CHECK (channel IN ('sms', 'voice')),
  match_kind    TEXT NOT NULL CHECK (match_kind IN ('prefix', 'number', 'carrier')),
  match_value   TEXT NOT NULL,           -- E.164 prefix, number or carriers.id
  reason        TEXT NOT NULL CHECK (reason IN ('sms_pumping', 'irsf', 'special_services',
                  'carrier_report', 'manual')),
  evidence      JSONB NOT NULL DEFAULT '{}',     -- conversion rate, volume, reporting carrier
  blocked_during TSTZRANGE NOT NULL,
  lifted_reason TEXT,
  created_by    TEXT NOT NULL,
  CHECK ((scope = 'account') = (account_id IS NOT NULL))
);

CREATE TABLE verification_outcomes (     -- each one-time code's result, from the verify
  message_id    UUID PRIMARY KEY REFERENCES messages (id),  -- product or a customer callback
  account_id    UUID NOT NULL REFERENCES accounts (id),
  status        TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'expired', 'failed')),
  source        TEXT NOT NULL CHECK (source IN ('verify_product', 'customer_callback')),
  decided_at    TIMESTAMPTZ
);

CREATE TABLE fraud_safe_list (           -- numbers a customer vouches for
  account_id    UUID NOT NULL REFERENCES accounts (id),
  e164          TEXT NOT NULL,
  added_by      TEXT NOT NULL,
  valid_during  TSTZRANGE NOT NULL,
  PRIMARY KEY (account_id, e164)
);
```

Conversion monitoring needs the verification outcome. Where the platform runs the verification product it has it; otherwise the customer reports it by callback. A query over the last hour, per account and destination prefix:

```sql
-- Prefixes where codes are sent but not entered: candidates for an account-level block
SELECT m.account_id,
       left(m.peer_e164, 7)                        AS prefix,
       count(*)                                    AS codes_sent,
       count(v.message_id)                         AS codes_verified,
       count(v.message_id)::numeric / count(*)     AS conversion
FROM messages m
LEFT JOIN verification_outcomes v ON v.message_id = m.id AND v.status = 'approved'
WHERE m.direction = 'outbound'
  AND m.accepted_at > now() - interval '1 hour'
  AND m.campaign_id IN (SELECT resource_id FROM sms_campaigns WHERE use_case = '2FA')
GROUP BY 1, 2
HAVING count(*) >= 50
   AND count(v.message_id)::numeric / count(*) < 0.10;
```

The thresholds (50 codes, 10% conversion) are illustrative; tune them per country from the platform's own history.

Notes on the sketch:

- **Permissions are effective-dated rows with an actor.** "Who opened Argentina on this account, and when?" is the first question in a fraud dispute; the row answers it, and `acknowledged_risk` records that the customer overrode a safer default.
- **Blocks have two scopes.** A platform-scope block protects every customer from a known range; an account-scope block responds to one customer's attack without affecting others.
- **Evidence travels with the block,** so an appeal ("our real users are in that range") can be judged and the block lifted with a reason.
- **Spend caps are quotas,** so they share the core model's defaults, overrides and history.
- **Events:** `geo_permission.changed`, `fraud_block.created`, `fraud_block.lifted`, `quota.changed` (with `source = 'risk'`) and `fraud.alert` go to the customer's notifications and the abuse desk through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Every permission change** with its actor and whether it overrode a default, because liability follows the configuration.
- **Every block** with its evidence and how long it was in force.
- **Alerts sent and when,** to show the customer was told.
- **Usage to blocked or high-risk destinations** before and after detection, for the forgiveness decision and for disputes with the carrier chain.
- **Staff access to customer accounts and admin tools,** because the platform's own breach is the largest fraud exposure it has ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).

## What This Means for the System You Build

- **Default new accounts to their home country** for SMS and voice, and make every expansion an explicit, logged change.
- **Maintain platform-wide prefix and range blocks** from all customers' traffic, and keep the lists private.
- **Monitor verification conversion** per destination, and throttle where codes go out and never come back.
- **Cap international concurrency and spend** with quotas, and alert within minutes, not at invoice time.
- **Secure the platform's own staff and endpoints** with phishing-resistant authentication and rate-limited lookups.
- **Decide who pays before the incident:** safe defaults, recorded overrides, and a forgiveness policy that rewards customers who kept the defaults.

## References

**Provider documentation**

- [Twilio: What is SMS pumping fraud](https://www.twilio.com/docs/glossary/what-is-sms-pumping-fraud), the scheme, its signals and mitigations
- [Twilio: SMS Fraud Guard](https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard), prefix blocking from historical anomalies, protection levels, Geo Permissions and the Safe List
- [Twilio: Verify Geo Permission update](https://www.twilio.com/en-us/changelog/Verify_Geo_Permission_Update), the August 19, 2026 default change for Italy and Argentina and who bears the cost
- [Twilio: Voice dialing geographic permissions](https://www.twilio.com/docs/voice/tutorials/voice-dialing-geographic-permissions), IRSF, the $10 billion vendor estimate, high-risk and special-services ranges
- [Twilio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000021/twlo-20251231.htm), Verify Fraud Guard and artificially inflated traffic
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), Maestro and third-party fraud tools

**Incidents and cases**

- [Twilio: August 2022 social engineering attack](https://www.twilio.com/en-us/blog/august-2022-social-engineering-attack), the smishing breach, affected customers and Authy users, FIDO2
- [Twilio: Authy security alert (July 2024)](https://www.twilio.com/en-us/changelog/Security_Alert_Authy_App_Android_iOS), the unauthenticated endpoint
- [Commsrisk: Musk says Twitter lost $60mn a year to SMS pumping](https://commsrisk.com/elon-musk-says-twitter-lost-60mn-a-year-because-390-telcos-used-bot-accounts-to-pump-a2p-sms/), the December 20, 2022 statement
- [Twitter: An update on two-factor authentication using SMS](https://blog.x.com/en/product/an-update-on-two-factor-authentication-using-sms-on-twitter), February 15, 2023, SMS 2FA limited to Twitter Blue after March 20, 2023
- [Engadget: Twitter makes SMS two-factor authentication a paid feature](https://www.engadget.com/twitter-text-based-two-factor-authentication-paid-feature-075852904.html), the March 20, 2023 change
- [FCC: Gerri Murphy Realty v. AT&T (2001)](https://transition.fcc.gov/eb/Orders/2001/fcc01310.html), customer liability for PBX toll fraud under the tariff, and the capped-liability plan
- [TNS: The telecom fraud landscape in 2026](https://tnsi.com/resource/com/the-telecom-fraud-landscape-in-2026-how-the-industry-is-fighting-back-blog), CFCA's 2023 and 2025 loss estimates as reported
