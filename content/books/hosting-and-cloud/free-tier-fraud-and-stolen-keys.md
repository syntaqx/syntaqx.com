+++
title = "Free-Tier Fraud & Stolen Keys"
description = "Abuse aimed at the provider's own resources: free-tier farming, cryptomining, leaked cloud keys and their quarantine, LLMjacking and secret scanning."
category = "Hosting & Cloud Industry"
order = 2199
part = "Abuse, Trust and the Law"
tags = ["fraud", "free-tier", "cryptomining", "credentials", "secret-scanning"]
+++

Most abuse an infrastructure provider handles harms someone else: a phishing page, a spam run, a scan of another network. This chapter is about abuse whose first victim is the provider or its customer's bill. Free compute is worth stealing because it converts directly to money: a cryptocurrency miner turns CPU and GPU time into coins, a reverse proxy turns someone else's access to a language model into a resold service, and a stolen key turns a stranger's account into a botnet that the stranger pays for. The attacks come in two shapes. Free-tier fraud opens accounts the provider never gets paid for. Credential theft takes over accounts that do pay, until the owner sees the bill.

The chapter adds `credential_exposures`, and two signals on the UGP volume's `account_links`, to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) and uses its `quotas` with `source = 'risk'`. Credential design (prefixes, scopes, expiry, hashing) is [Identity, IAM and API Keys](/books/hosting-and-cloud/accounts-and-resellers#identity-iam-and-api-keys); the CI breaches that leak keys in bulk are [Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security); free-tier and credit design itself is [Free Tiers, Credits & Startup Programs](/books/hosting-and-cloud/free-tiers-and-credits#fraud-exposure); bill forgiveness after a compromise is [Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills#surprise-bills-and-forgiveness).

## How the Providers Do It

| Provider | Free offer, as of October 2026 | Anti-abuse terms | Leaked-key response |
| --- | --- | --- | --- |
| **AWS** | Since July 15, 2025: $100 in credits at sign-up and up to $100 more for activities; the free plan expires 6 months after sign-up or when credits run out, whichever comes first; an account not upgraded within 90 days of that is permanently erased | AUP bars fraud and security violations | Attaches the managed policy `AWSCompromisedKeyQuarantineV3` to an IAM user whose keys were exposed and opens a support case |
| **Google Cloud** | $300 welcome credit over 90 days | No cryptocurrency mining during the free trial; outside it, not without Google's prior written approval | Since June 16, 2024, exposed service account keys are disabled by default, under the organization policy `iam.serviceAccountKeyExposureResponse` |
| **GitHub** | Free Actions minutes and hosted runners | Actions terms list "Cryptomining" as prohibited, on hosted or self-hosted runners | Secret scanning partner program forwards leaked tokens to their issuers; push protection on by default for new public repositories of personal accounts since March 11, 2024 |
| **Heroku** | Free dynos, Postgres and Redis ended November 28, 2022 | Ending the free plans was itself the control | Not covered here |

Four responses, in rising order of cost to honest users: **terms** that make the abuse a breach the provider can act on, **detection** that finds it, **containment** that limits what a new or compromised account can do, and **removal** of the free offer when the first three cost more than the offer earns. Heroku took the last step: announcing the end on August 25, 2022, it said it would stop spending effort to "manage fraud and abuse of the Heroku free product plans."

## How It Got Here

- **November 2021:** Google's first Threat Horizons report found about 86% of 50 compromised Google Cloud instances mining cryptocurrency.
- **August 25, 2022:** Heroku announced the end of its free plans, which ended November 28, 2022, citing fraud and abuse.
- **March 11, 2024:** GitHub turned on secret scanning and push protection by default for new public repositories of personal accounts.
- **May 6, 2024:** Sysdig named LLMjacking, stolen cloud credentials resold as model access.
- **June 16, 2024:** Google Cloud began disabling exposed service account keys by default.
- **August 21, 2024:** AWS created the current version of its quarantine policy, `AWSCompromisedKeyQuarantineV3`, last edited March 16, 2026.
- **July 15, 2025:** AWS moved new accounts to a free plan of time-boxed credits.

## Free-Tier Farming

A free tier is a marketing budget that attackers can spend. The attack is volume: many accounts, each staying under the limits, created with disposable email addresses, prepaid or stolen cards, and rotating IPs. What they run is whatever converts to money or to cover: miners, proxies and VPN exits, spam relays, scanners, phishing pages on the provider's trusted domain, and bots for other platforms' sign-up flows. The fraud shows up in the provider's own numbers as accounts that never convert and resources that run at full utilization from minute one.

The controls, from cheapest to most intrusive:

- **Make the free offer smaller where abuse concentrates.** Allowances by product, not one pool of credits that can buy GPUs; outbound mail blocked by default; no GPU or large instance types on trial accounts. AWS's 2025 change moved new accounts to a time-boxed credit plan that expires and then deletes the account if not upgraded, which caps the value of a farmed account.
- **Verify at sign-up in proportion to what the account can do.** A card check, a phone check, or both; stronger checks before quota increases. The quotas a new account gets are the real limit, so they belong to the risk system, not only the capacity planner.
- **Link accounts.** One payment fingerprint, device, phone number, IP range or SSH key across many accounts is a ring. Linking lets the provider act on all of them at once, the fan-out that terminated the R2 services of 59,843 related accounts at Cloudflare in the second half of 2025 ([Automation and Scale](/books/hosting-and-cloud/abuse-on-infrastructure#automation-and-scale)).
- **Watch the first hours.** Sustained full CPU on a fresh account, outbound connections to known mining pools, mass outbound SMTP or port scanning are signals that need no content inspection.
- **End the tier.** When abuse dominates, as Heroku concluded.

## Cryptomining

Mining is the dominant use of stolen and free compute because it needs nothing but cycles and pays immediately. Google's first Threat Horizons report (November 2021) studied 50 recently compromised Google Cloud instances: about 86% were used for cryptocurrency mining, 10% for scanning other systems and 8% for attacking other targets; 48% had been compromised through weak or no passwords and 26% through vulnerable third-party software; and in 58% of cases the mining software was downloaded within 22 seconds of the compromise. The last number is the design constraint: a human response is too slow, so containment has to be automatic.

Detection uses what the provider can see without reading customer data: CPU and GPU utilization profiles, process-independent network signals (connections to known mining pool hosts and ports), and billing anomalies (a sudden jump in instance count in regions the account never used). The action is the narrowest one that stops spend: stop the instances, place a `no_new_resources` hold and contact the owner, since most mining on paying accounts runs on stolen credentials and the owner is a victim.

## Stolen Keys

A long-lived access key in a public repository, a container image, a CI log or a mobile app is public the moment it is pushed, and the Threat Horizons numbers show how fast stolen access gets used. The provider has three ways to learn about it: a code host tells it, its own scanning finds it, or the bill does.

**Secret scanning partnerships.** GitHub's secret scanning partner program lets a token issuer register regular expressions for its token formats and an endpoint; when a match appears in a public repository or an npm package, GitHub sends a signed payload to the issuer, who verifies it, revokes or quarantines the token and notifies the owner. GitHub's guidance to issuers is to design tokens that can be found: a unique prefix, high entropy and a 32-bit checksum, so matches have few false positives; and to treat every reported secret as "public and compromised." The provider-side rule is [Prefixes Say What a Key Is](/docs/api-design/authentication#prefixes-say-what-a-key-is): AWS access key IDs beginning `AKIA` are long-term and `ASIA` temporary. GitHub also blocks known secrets before they are pushed: from March 11, 2024, "all new public repositories owned by personal accounts will now have secret scanning and push protection enabled by default."

**Quarantine instead of revocation.** Revoking a key breaks whatever legitimate workload uses it; leaving it live lets the attacker in. AWS's answer is a managed deny policy attached to the exposed IAM user. `AWSCompromisedKeyQuarantineV3` (created August 21, 2024, edited March 16, 2026) is "applied by AWS in the event that an IAM user's credentials have been compromised or exposed publicly," with the instruction to follow the support case created for the customer. Its deny list is a map of what attackers do with a stolen key: launch compute (`ec2:RunInstances`, `ec2:RequestSpotInstances`, `lambda:CreateFunction`), create persistence (`iam:CreateUser`, `iam:CreateAccessKey`, `organizations:CreateAccount`), invoke models (`bedrock:InvokeModel`, SageMaker jobs), read data (`s3:GetObject`) and hold the owner to ransom by destroying keys (`kms:ScheduleKeyDeletion`). Google Cloud went further for service account keys: from June 16, 2024, exposed keys are disabled automatically by default, and an organization can set the constraint to `WAIT_FOR_ABUSE` instead of `DISABLE_KEY` to keep the old behavior.

**LLMjacking.** Sysdig's report of May 6, 2024 named the newest use of stolen cloud credentials: attackers who took credentials through a Laravel vulnerability (CVE-2021-3129) checked which of ten AI services the account could reach, including Amazon Bedrock, and resold model access through a reverse proxy. Sysdig estimated the victim's worst-case cost at "over $46,000 of LLM consumption costs per day." Model invocation is now in the quarantine deny list for that reason, and model access belongs behind the same risk quotas as GPUs.

## The Alternatives

| Control | Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **AUP terms only** | Prohibit mining and farming; act on reports | Cheap; gives the legal basis for action | Finds abuse after the spend | Reviewer time | Every provider |
| **Sign-up verification** | Card, phone, identity checks scaled to risk | Raises the cost of each fake account | Excludes honest users without cards; stolen cards pass | Friction and verification fees | Most clouds |
| **Risk quotas** | New and unverified accounts get small limits, especially on GPUs and mail | Caps the damage of any one account | Legitimate growth hits limits and needs a request path | Support load | Hyperscalers' default quotas |
| **Account linking** | Act on rings through shared signals | Removes many accounts per decision | Weak links punish innocents at scale | Data engineering | Providers with fraud teams |
| **Partner secret scanning** | Code hosts push leaked tokens to the issuer | Fast detection with no customer action needed | Only finds known formats in places the partner scans | Integration work; good token design | GitHub's partners |
| **Quarantine policy** | Deny the dangerous actions, keep the key | Stops abuse without breaking legitimate reads | Needs the provider's own policy engine | Low | AWS |
| **Automatic disable** | Disable exposed keys by default | Closes the window entirely | Breaks workloads using the key | Low | Google Cloud service account keys |
| **No free tier** | Pay from the first minute | Ends farming | Loses the acquisition channel | Lost sign-ups | Heroku since 2022 |

## My Default

My default is a free offer that is time-boxed and capped by product (no GPUs, no outbound SMTP, small default quotas) with risk quotas that rise with verification and payment history, account linking on payment, device and network signals with the link strength recorded, and automatic containment of the first minutes of mining. For credentials: prefixed, checksummed token formats registered with GitHub's partner program and every other code host and registry that scans, an automatic quarantine on report (deny compute creation, identity creation, model invocation and key destruction; keep reads that a production workload needs), a support case to the owner, and full revocation after 24 hours or on the owner's word. The bill from the window between leak and quarantine is a forgiveness decision, not an argument.

What would change this: a provider whose free tier is its main acquisition channel and whose products are hard to monetize by abuse (static hosting with no outbound network) can be more generous; one selling GPUs or model access should demand payment verification before the first dollar of either.

## How to Build It

One table and one extension. `credential_exposures` records every report or detection of a leaked credential and what was done about it, keyed to [`api_credentials`](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it). `account_links`, the [User-Generated Platforms volume's table](/books/user-generated-platforms/spam-and-bots#how-to-build-it), records the signals that connect accounts, so a ring can be acted on and a wrong link unwound; this chapter adds two signals to it. Risk limits are `quotas` rows with `source = 'risk'`, which already sit beside default and applied limits in the core model.

```sql
CREATE TABLE credential_exposures (      -- a leaked credential, reported or found
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  credential_id     UUID REFERENCES api_credentials (id),   -- null: no match to a live key
  credential_prefix TEXT NOT NULL,       -- what was reported; never the full secret
  source            TEXT NOT NULL CHECK (source IN ('code_host_partner', 'registry_partner',
                      'own_scan', 'customer_report', 'third_party_report',
                      'anomaly_detection')),
  source_ref        TEXT,                -- the partner's alert id
  location          TEXT,                -- the public URL, package or image where it appeared
  first_seen_at     TIMESTAMPTZ,         -- when it became public, if known
  reported_at       TIMESTAMPTZ NOT NULL,
  response          TEXT NOT NULL CHECK (response IN ('quarantined', 'revoked', 'disabled',
                      'no_match', 'already_revoked', 'false_positive')),
  responded_at      TIMESTAMPTZ NOT NULL,
  owner_notified_at TIMESTAMPTZ,
  abuse_observed    BOOLEAN,             -- calls from unknown networks after first_seen_at
  case_id           UUID REFERENCES moderation_cases (id),
  CHECK (responded_at >= reported_at)
);

-- account_links is the UGP volume's table (Spam, Bots & Coordinated Behavior): one row per
-- pair and signal, a 0 to 1 strength, and a suspected, confirmed or dismissed status. A
-- provider adds the signals infrastructure abuse leaves behind (payment cards, device,
-- phone, network and an admission map onto its existing values):
ALTER TABLE account_links
  DROP CONSTRAINT account_links_signal_check,
  ADD CONSTRAINT account_links_signal_check CHECK (signal IN ('device',
    'payment_instrument', 'phone', 'email_pattern', 'network', 'identity_document',
    'behavior', 'admitted', 'ssh_key', 'workload_hash'));
CREATE INDEX ON account_links (account_b_id);

ALTER TABLE quotas
  ADD COLUMN risk_reason TEXT CHECK (risk_reason IN ('new_account', 'unverified_payment',
    'linked_to_abuse', 'credential_exposure')),
  ADD CONSTRAINT quotas_risk_reason CHECK ((source = 'risk') = (risk_reason IS NOT NULL));
```

A fresh account's limits are risk rows that expire as trust builds:

```sql
INSERT INTO quotas (quota_code, account_id, region_id, limit_value, source, risk_reason,
                    valid_during)
VALUES ('gpus.on_demand', $1, NULL, 0, 'risk', 'new_account',
        tstzrange(now(), now() + interval '30 days')),
       ('smtp.outbound_per_hour', $1, NULL, 0, 'risk', 'new_account',
        tstzrange(now(), NULL));         -- lifted only by request and review
```

The fan-out a confirmed ring triggers, limited to strong links so a weak signal never suspends anyone by itself:

```sql
SELECT CASE WHEN l.account_a_id = $1 THEN l.account_b_id ELSE l.account_a_id END
         AS linked_account_id,
       array_agg(DISTINCT l.signal) AS signals
FROM account_links l
WHERE $1 IN (l.account_a_id, l.account_b_id)
  AND l.status = 'confirmed' AND l.strength >= 0.8   -- the provider's threshold for "strong"
GROUP BY 1;
```

Notes on the sketch:

- **The secret is never stored here.** The prefix and the partner's reference identify it; the credential row is found by hash, as in the accounts chapter.
- **Time to respond is a column pair.** `reported_at` and `responded_at` give the exposure window per report, the number a provider should publish to itself weekly.
- **Quarantine is a ceiling.** It is a [`permission_ceilings`](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it) row on the affected principal with the deny list above, so it composes with the customer's own policies and lifts cleanly.
- **Links are evidence, not verdicts.** Each has a signal, a strength and a status; a reviewer who disproves one sets it to `dismissed`, and actions taken on it are reviewed.
- **Holds follow.** A confirmed farm gets `account_holds` with reason `fraud` and effect `full_suspension`; a compromised paying account gets `no_new_resources` and a case, because the owner is a victim.
- **Events:** `credential.leak_reported`, `credential.quarantined`, `account_link.created`, `account_link.closed` and `quota.changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the policy engine, the owner notice service, the fraud queue and billing.

## Auditing

- **Every exposure and the response time,** by source, so slow partners and slow paths show up.
- **Spend during the exposure window,** joined from `rated_usage` for the account between `first_seen_at` and `responded_at`, for forgiveness decisions.
- **Every link and every action taken on it,** and every link later closed as wrong.
- **Risk quotas and their lifting,** with who approved each increase.

## What This Means for the System You Build

- **Cap the free offer by product and time,** and keep GPUs, model access and outbound mail out of it.
- **Give new accounts risk quotas** that rise with verification and history.
- **Link accounts on strong signals** and act on rings together, with every link recorded and reversible.
- **Contain mining in the first minutes** automatically; a person is too slow.
- **Design tokens to be found** (prefix, entropy, checksum) and register them with every scanning partner.
- **Quarantine leaked keys automatically,** denying compute, identity creation, model invocation and key deletion, and tell the owner.
- **Treat a compromised paying customer as a victim:** stop the spend, then forgive it on evidence.

## References

**Provider terms and programs**

- [AWS: AWS Free Tier update](https://aws.amazon.com/about-aws/whats-new/2025/07/aws-free-tier-credits-month-free-plan/), July 2025, credits at sign-up and the six-month free plan
- [AWS: Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/), suspension at the end of the free plan and erasure after 90 days
- [Google Cloud: Free cloud features and trial](https://docs.cloud.google.com/free/docs/free-cloud-features), the $300 credit over 90 days and the mining prohibition during the trial
- [Google Cloud: Terms of Service (July 1, 2025 version)](https://cloud.google.com/legal/archive/terms/index-20250701), cryptocurrency mining without prior written approval
- [GitHub: Terms for additional products and features](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features), cryptomining prohibited on Actions
- [Heroku: Heroku's next chapter](https://www.heroku.com/blog/next-chapter), August 25, 2022, the end of free plans and the fraud rationale

**Leaked credentials**

- [GitHub Docs: Secret scanning partner program](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-partnership-program/secret-scanning-partner-program), registration, payloads, token design advice and "public and compromised"
- [GitHub Changelog: Secret scanning and push protection enabled by default on new public repositories](https://github.blog/changelog/2024-03-11-secret-scanning-and-push-protection-are-enabled-by-default-on-new-public-repositories/), March 11, 2024
- [AWS: AWSCompromisedKeyQuarantineV3](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSCompromisedKeyQuarantineV3.html), when AWS applies it, its dates and its deny list
- [Google Cloud: Automatically disabling leaked service account keys](https://cloud.google.com/blog/products/identity-security/automatically-disabling-leaked-service-account-keys-what-you-need-to-know), from June 16, 2024, and the organization policy values

**Research**

- [Google Cloud: Threat Horizons report, November 2021](https://services.google.com/fh/files/misc/gcat_threathorizons_full_nov2021.pdf), uses of compromised instances, entry points and the 22-second download
- [Sysdig: LLMjacking](https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack), May 6, 2024, stolen credentials resold as model access and the daily cost estimate
