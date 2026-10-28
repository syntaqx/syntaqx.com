+++
title = "WAF, Bots & Rate Limits"
description = "Managed and custom WAF rules, anomaly scoring, virtual patching, rule rollout, bot scores and challenges, AI crawlers and pay per crawl, and edge rate limits."
category = "Hosting & Cloud Industry"
order = 2178
part = "The Edge"
tags = ["waf", "bots", "rate-limiting", "edge", "security", "ai-crawlers"]
+++

Every request that reaches an edge network is asked three questions before it reaches the customer's origin. Is it an attack on the application (an injection, a path traversal, an exploit for a vulnerability announced this morning)? Is it a person, a useful bot, or automation the site doesn't want? Is this client asking too often? The products that answer them are the web application firewall, bot management and rate limiting, and an edge provider sells all three as rules that run in its proxy, written partly by the provider (managed rulesets, bot models, verified-bot lists) and partly by the customer (custom rules, rate limits, crawler policies).

The industry twist is that the provider writes and ships rules for millions of sites at once. That makes it the fastest patch most sites ever get (a rule for a new CVE can be live everywhere before the CVE is public), and it makes the rule push one of the most dangerous changes the provider makes, because a rule runs on every request on every server, and a global data push bypasses the canaries a code deploy goes through. It also makes the provider an arbiter between sites and crawlers: robots.txt asks, and an edge can enforce, charge, or verify a crawler's identity. This chapter covers the WAF's history and mechanics (managed versus custom rules, anomaly scoring, log before block, false positives, emergency rules), how rule rollout fails, bots from CAPTCHA to scores and signed requests, account takeover at the edge, AI crawlers and pay per crawl, rate limiting at the edge, plan gating and pricing, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with rulesets, rules, deployments, rate-limit rules and crawler policies. Flood defense is [DDoS Mitigation](/books/hosting-and-cloud/ddos-mitigation); the general practice of admission and fairness is the playbook's [Admission, Rate Limiting and Load Shedding](/docs/architecture/admission-control#admission-rate-limiting-and-load-shedding).

## How the Providers Do It

As of October 2026:

| Provider | WAF | Modes before blocking | Bots | Rate limiting | Plan gating or price |
| --- | --- | --- | --- | --- | --- |
| **Cloudflare** | Managed Ruleset, OWASP Core Ruleset (anomaly score, paranoia levels), Free Managed Ruleset; custom rules in the Rules language | Log action on Enterprise | Bot score 1 to 99 (1 automated, 99 human), verified bots, JA3/JA4, Turnstile, Web Bot Auth | Rules with characteristics, period, threshold, timeout; per data center counters | Custom rules 5, 20, 100, 1,000 by plan; Managed and OWASP rulesets from Pro; granular bot scores Enterprise only |
| **Akamai** | App & API Protector with an Adaptive Security Engine and automatic updates | Response tiers: watch, challenge, mitigate | Bot Manager score 0 (human) to 100 (bot), known-bot directory, "stealthy" responses such as slowing or serving cached content | In App & API Protector | Contracted |
| **Fastly** | Next-Gen WAF (from the Signal Sciences acquisition, closed 1 Oct 2020) at the edge or as an agent | Blocking, Not Blocking (Logging), Off; blocked requests get 406 | Bot Management | Attack and signal thresholds | Contracted |
| **AWS WAF** | Web ACLs of rules and rule groups (AWS Managed Rules, Marketplace sellers, own) measured in WCUs | Count action | Bot Control (Common, Targeted), Web Bot Auth labels, CAPTCHA and Challenge actions, ATP and ACFP | Rate-based rules over 1 to 10 minute windows | $5 a web ACL, $1 a rule, $0.60 per million requests; Bot Control and fraud control priced separately |
| **Google Cloud Armor** | Security policies with preconfigured WAF rules based on CRS (4.22, 3.3, 3.0) | Preview mode | reCAPTCHA redirect actions | Throttle and rate-based ban with per-key enforcement | Standard and Enterprise tiers (the pricing page didn't render) |
| **Azure Front Door WAF** | Default Rule Set (anomaly score from 2.0), Bot Manager rule set, custom rules | Detection mode | Bad, Good and Unknown bot categories; JS challenge | Per client IP over one or five minutes; ASN, country or JA4 on Premium | Managed rule sets on Premium; Standard supports custom rules only |
| **Bunny (Shield)** | WAF against OWASP Top 10 and zero-days with real-time logs | Not stated on the page opened | Bot detection | Per IP, user or path | Shield tiers |

Three patterns run through the table:

- **Every WAF has a log-only mode,** under five different names (Log, Count, Not Blocking, Preview, Detection), because rules are written against traffic nobody has seen yet.
- **The provider ships rules; the customer tunes them.** Managed rulesets update without the customer's involvement, and the customer's controls are overrides, exclusions and thresholds.
- **Bot vocabulary isn't shared.** A Cloudflare score of 1 means automated; an Akamai score of 0 means human. The book's model stores a normalized likelihood and keeps each vendor's raw score beside it.

## How WAFs, Bots and Rate Limits Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 1994 | Martijn Koster's robots exclusion method | Telling crawlers what not to fetch | Voluntary: "not a form of access authorization" |
| Nov 1999 | Students at Carnegie Mellon and MIT stuff Slashdot's graduate-school poll with voting bots | (The problem) automation passing as people | |
| 2002 | Ivan Ristić starts ModSecurity as an Apache module, later with a rule language | Inspecting request bodies and responses in front of an application | Rules to write and tune per application |
| 2003 | "CAPTCHA: Using Hard AI Problems for Security" (von Ahn, Blum, Hopper, Langford, EUROCRYPT 2003) | Tests "most humans can pass" and programs can't | Human time; an arms race with AI |
| 16 Sep 2009 | Google acquires reCAPTCHA | CAPTCHA as a hosted service | A third party's script on the page |
| 6 Oct 2015 | AWS WAF launches for CloudFront: allow, block or count; $5 a web ACL, $1 a rule, $0.60 per million requests | A WAF as a metered cloud feature | Per-rule and per-request billing |
| 2 Jul 2019 | A WAF Managed Rules regex exhausts CPU on Cloudflare's network for 27 minutes | (The failure) a rule push that went "global in seconds" | Staged rollout for rules |
| 1 Oct 2020 | Fastly completes the Signal Sciences acquisition | An edge network buying a next-gen WAF | |
| 10 to 14 Dec 2021 | Log4Shell (CVE-2021-44228): Cloudflare rules 10 Dec, Cloud Armor `cve-canary` 11 Dec, AWS managed rule guidance 12 to 14 Dec | Virtual patching for a library in millions of applications | Bypass variants; rules updated for days |
| 8 Jun 2022 | Private Access Tokens: the device vendor attests the client, so sites skip CAPTCHAs | Proof of a real device without a puzzle | Dependence on platform vendors |
| Sept 2022 | RFC 9309 standardizes the Robots Exclusion Protocol | One parsing and caching behavior for robots.txt | Still advisory |
| 28 Sep 2022 | Cloudflare Turnstile, a free CAPTCHA alternative for any site | Challenges without puzzles or tracking cookies | Another vendor's script |
| Feb 2024 | RFC 9421, HTTP Message Signatures | Signing requests, later used for bot identity | Key management for crawlers |
| 9 Jan 2024 | ModSecurity moves from Trustwave to OWASP; Trustwave's sponsorship ended 1 Jul 2024 | A home for the reference open-source engine | Volunteer maintenance |
| June 2024 | Privacy Pass RFCs 9576, 9577 and 9578 | A standard for unlinkable authorization tokens | |
| 3 Jul 2024 | One-click AI bot blocking on every Cloudflare plan, including Free | Sites that didn't want training crawlers | Crawlers that don't identify themselves |
| 1 Jul 2025 | Pay per crawl (HTTP 402, Web Bot Auth); new domains asked whether to allow AI crawlers | Charging crawlers instead of only blocking them | A payment intermediary between sites and AI companies |
| 18 Nov 2025 | A Bot Management feature file doubles past a hard limit and takes down Cloudflare's proxy | (The failure) generated config pushed everywhere | Validate generated data like user input |
| 2 to 5 Dec 2025 | React Server Components RCE (CVE-2025-55182): Cloudflare rules live 2 Dec before disclosure; a related global config change causes a 25-minute outage 5 Dec | Virtual patch ahead of the CVE | Staged rollout for threat-response data too |
| 23 May 2026 | IETF RateLimit header fields draft reaches -11, still an Internet-Draft | A standard way to tell clients their limits | |

## Managed Rulesets and Custom Rules

A WAF rule is an expression over request fields and an action. The expression language differs by vendor (Cloudflare's Rules language, Cloud Armor's custom rules language with functions such as `inIPRange()` and `evaluatePreconfiguredWaf()`, AWS WAF's statements, ModSecurity's `SecRule`), but the shape is constant, and it is the playbook's [shape of a rule](/docs/architecture/rules-as-data#the-shape-of-a-rule): a condition, an outcome, a priority, an owner and a validity. ModSecurity's language set the vocabulary: `SecRule` reads "over one hundred variables" from requests and responses, matches them with regular expressions, numeric comparisons and a parallel phrase matcher, and denies with "403 Forbidden" by default.

Rules come in two kinds, and every provider separates them:

- **Managed rulesets** are written and updated by the provider or a third-party seller. Cloudflare's are the Cloudflare Managed Ruleset (known attack techniques and zero-days, "updated frequently"), the Cloudflare OWASP Core Ruleset (an implementation of the OWASP CRS), a Free Managed Ruleset for "high-impact, widely exploited vulnerabilities," and Sensitive Data Detection on responses (Enterprise). AWS sells AWS Managed Rules and lets Marketplace sellers price their own (its example: $20 a month plus $1.20 per million requests). Cloud Armor's preconfigured rules are based on CRS and recommend "that you don't use a lower version than 4.22." Azure's Default Rule Set covers cross-site scripting, Java and PHP attacks, file inclusion, remote command execution, session fixation, SQL injection and protocol attacks.
- **Custom rules** are the customer's: IP and country lists, path and header matches, size constraints, method restrictions, bot-score thresholds. Azure processes them before managed sets, and a match stops evaluation; Cloudflare runs them in order, and "some actions like Block will stop the evaluation of other rules."

The customer's control over a managed ruleset is the **override**, not an edit. Cloudflare's overrides change an action or disable rules at the ruleset, tag or rule level; ruleset and tag overrides apply to rules added later, rule overrides only to existing rules, and **exceptions** (skip this rule for this path) take priority over overrides. A customer who disables a rule by tag is opting out of rules that don't exist yet, which is the right default for "this tag breaks my CMS" and the wrong one for "this tag is noisy today."

AWS expresses capacity as web ACL capacity units (WCUs): each rule costs units by complexity (a rate-based rule is 2, plus 30 per custom aggregation key), a web ACL gets 1,500 by default, and capacity above that is billed per request. The unit makes the cost of inspection visible to the customer, which most WAFs hide.

## Anomaly Scoring and Paranoia Levels

A single signature is either too narrow (misses variants) or too broad (blocks real users). The OWASP Core Rule Set's answer is **anomaly scoring**: detection rules don't block; each match adds its severity to a running score (critical 5, error 4, warning 3, notice 2), and a separate evaluation rule blocks if the total reaches a threshold, 5 for inbound requests and 4 for outbound responses by default. In the project's words, "the inspection/detection rule logic is decoupled from the blocking functionality." One critical match blocks; two notices don't; a request that trips several weak rules adds up. CRS warns that raising thresholds "lets many attacks bypass CRS" and should be temporary during tuning.

**Paranoia levels** decide which rules run. Level 1 is baseline protection with few false positives, for "everybody running an HTTP server on the internet"; level 2 suits sites with real user data, such as a shop, with some tuning; level 3 is banking-grade with many false positives expected; level 4 protects critical assets "at your own risk." CRS separates the **executing** level from the **blocking** level, so higher-level rules can run and be measured without counting toward the score, the right way to raise a level.

Providers that implement CRS expose the same two dials with their own numbers. Cloudflare's OWASP ruleset sums its rules' scores into a request threat score and acts at a threshold of Low (60 and higher), Medium (40, the default) or High (25), and selecting a paranoia level enables all lower ones; it warns that High can make file uploads trip rule 949110 (Inbound Anomaly Score Exceeded). Azure's Default Rule Set 2.0 and later uses an Anomaly score action by default.

## Log Before Block

The rule every provider builds in: a new rule, a new ruleset version or a raised paranoia level runs in a mode that records what it would have done before it does it. Cloudflare's Log action (available on Enterprise), AWS WAF's Count (there since the 2015 launch "so new rules could be tested"), Fastly's Not Blocking (Logging), Cloud Armor's preview (`--preview`, results in Cloud Monitoring, billed at the normal per-request rate, and evaluation continues to an enforced rule) and Azure's Detection mode are the same feature. The log tells the customer what fraction of matches are false positives, on which paths, before any user is blocked.

> [!WARNING]
> A rule in log mode still runs. Cloudflare's 2 Jul 2019 rule was meant for "simulate" mode, "where real customer traffic passes through the rule but nothing is blocked," and its regular expression still consumed every CPU core handling HTTP traffic worldwide. Log mode protects users from wrong decisions, not the fleet from expensive rules.

False positives are the WAF's operating cost and the reason customers turn WAFs off. The tools against them are exclusions scoped to a path or field (skip the SQL injection rule on the rich-text field that legitimately contains SQL keywords), executing-level testing before raising a paranoia level, and keeping a record of which rule blocked each request so a support ticket can name it, the playbook's [record which rule decided](/docs/architecture/rules-as-data#record-which-rule-decided). The playbook's [risk scoring](/docs/architecture/risk-scoring#changing-rules-and-models-safely) doc covers the same discipline for score thresholds.

## Emergency Rules and Virtual Patching

When a vulnerability is announced in software that millions of sites run, the edge can block exploit attempts before any of them patch. That is **virtual patching**: a rule that matches the exploit's shape, shipped in a managed ruleset with a default action, buying time for the real fix. The playbook's position on [why speed is the strategy](/docs/security/vulnerability-management#why-speed-is-the-strategy) applies, and a WAF rule is one of the compensating controls it lists; it is never the fix.

Log4Shell (CVE-2021-44228) is the reference case. The vulnerability became public on 9 Dec 2021. Cloudflare published on 10 Dec at 11:39 UTC with three rules inspecting headers, body and URL, later all set to a default action of Block, while urging that "anyone using Log4j should update to version 2.15.0 as soon as possible." Google added a preconfigured Cloud Armor rule, `cve-canary`, on 11 Dec, inspecting headers, URL and body and including "all future updates to this rule." AWS's bulletin of 12 to 14 Dec pointed customers to the `AWSManagedRulesKnownBadInputsRuleSet` and `AWSManagedRulesAnonymousIpList` groups, which it would "continue to iterate" as it learned more, and told customers wanting automatic updates to pick the default version. Three providers, one pattern: a named rule, a default action, automatic updates for customers who follow the managed version, and advice to patch anyway.

The React Server Components vulnerability (CVE-2025-55182, affecting React 19.0 to 19.2 and Next.js 15 through 16) showed the pattern ahead of disclosure. Cloudflare's security partners alerted it, and its rules "were deployed at 5:00 PM GMT on Tuesday, December 2, 2025," in both the Managed Ruleset and the Free Managed Ruleset, default Block, before the CVE announcement; it said it had "not observed any attempted exploit" by the time it published on 3 Dec. Customers on paid plans needed Managed Rules enabled; free customers had them on by default.

Two engineering consequences follow. A ruleset version is a dated, published artifact, so a customer can see which version protected them on a given day and pin or follow it ([effective dates and versions](/docs/architecture/rules-as-data#effective-dates-and-versions)). And an emergency rule is still a deploy, which is the next section.

## Rule Rollout Is a Deploy

WAF rules, bot model files and threat-response configuration are data, and providers built fast global pipelines for data so that a rule against an active attack lands everywhere in seconds. The same speed turns a bad rule into a network-wide outage, and the post-mortems agree on it:

- **2 Jul 2019:** the WAF rule went through Quicksilver, a distributed key-value store, and "a change to the rules went global in seconds"; its regex backtracked catastrophically and the outage lasted 27 minutes (13:42 to 14:09 UTC). Remediation included performance profiling for every rule, a regex engine with run-time guarantees (RE2 or Rust's), and staged rollouts for rules "while keeping an emergency global deployment option for active attacks."
- **18 Nov 2025:** a database permissions change produced duplicate rows in the query that builds the Bot Management feature file every five minutes; the file grew past a hard limit of 200 features (normal use was about 60), the new proxy panicked, and the old proxy scored all traffic 0, so customers blocking bots blocked real users. Remediation: treat generated configuration with the same validation as user input, and add more global kill switches.
- **5 Dec 2025:** while raising the WAF body buffer from 128 KB to 1 MB to protect Next.js applications against CVE-2025-55182 (that change rolled out gradually), an internal WAF testing tool was turned off through a global configuration system that "does not perform gradual rollouts"; a latent Lua bug in the older proxy returned 500s on about 28% of HTTP traffic for about 25 minutes. Remediation: staged rollouts with health validation and quick rollback for threat-response and configuration data, and fail-open handling that falls back to a known-good file.

The lesson for anyone building a rule pipeline is that data pushes need the same machinery as code deploys: a [canary](/docs/delivery/deployment-strategies#canary) stage on a slice of traffic or locations, automated health checks between stages, a [kill switch](/docs/delivery/feature-flags#kill-switches) per rule and per ruleset that doesn't depend on the pipeline that broke, validation of every generated file against its limits before it ships, and an emergency path that is faster (minutes, not hours) but still staged. The full incident narratives belong to the [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages#the-global-config-failure-pattern) chapter.

## Bots: From CAPTCHA to Scores

The CAPTCHA paper opened with a bot problem: in November 1999 a Slashdot poll on the best computer science graduate school became "a contest between voting bots," with MIT at 21,156 votes and Carnegie Mellon at 21,032. Its answer was a program that generates and grades tests "(A) most humans can pass, but (B) current computer programs can't pass," with the twist that any program that beats one solves a hard AI problem. Google bought reCAPTCHA on 16 Sep 2009. The cost was human: Cloudflare's 2022 Turnstile post quoted CAPTCHA's creator saying he had "unwittingly created a system that was frittering away, in ten-second increments, millions of hours" of human time, and the AI half of the bargain came true as models learned to solve the puzzles.

Bot defense moved from asking the user to asking the client:

- **Invisible challenges.** Turnstile (28 Sep 2022) runs "a series of small JavaScript checks" (proof of work, proof of space, probes for browser APIs and quirks), tuned per request, with no puzzle, and doesn't read or set cookies to track visitors. AWS WAF's Challenge action and CAPTCHA action issue a token the client carries; Azure offers a JS challenge for bot categories.
- **Attestation.** Private Access Tokens (8 Jun 2022) let the device vendor vouch for the client: "Rather than interrogating a device directly, we ask the device vendor to do it for us." Apple announced support in iOS 16 and macOS 13. The roles are standardized in the Privacy Pass architecture (RFC 9576, June 2024): a Client, an Attester that verifies properties of the client, an Issuer that issues tokens, and an Origin that redeems them, with tokens that are unlinkable to the client; RFC 9577 is the HTTP authentication scheme and RFC 9578 the issuance protocols.
- **Scores.** Every request gets a likelihood of automation computed from many signals, and the customer writes rules against the score.

## Bot Scores, Fingerprints and Verified Bots

Cloudflare's score runs from 1 to 99: 1 is automated, 2 to 29 likely automated, 30 to 99 likely human, and 0 means "not computed" (which "does not mean the request is safe or human"). Engines feed it: heuristics against a database of malicious fingerprints (usually scoring 1; a missing or empty User-Agent "immediately" scores 1), a machine learning model that produces most scores and retrains often, anomaly detection against a site's baseline (being deprecated), and JavaScript detections for headless browsers. Granular scores are sold only with Enterprise Bot Management; lower plans see categories. Akamai's Bot Manager runs the other way, 0 (human) to 100 (bot), from behavioral AI and browser fingerprinting via an injected script, and offers responses beyond block and allow: slowing bots, serving them cached content, and "stealthy defenses" that don't tip them off. AWS's Bot Control has a Common level (self-identifying bots, by static request analysis) and a Targeted level adding browser interrogation, fingerprinting, behavior heuristics and ML rules (`TGT_ML_`) for "distributed, coordinated bot activity," with rules that challenge clients sending five or more requests in five minutes without a token, and that flag a token used from more than 2, 5 or 8 IPs, or more than 1, 2 or 3 countries or ASNs, in five minutes.

**TLS fingerprints** identify the client software by how it opens a connection. JA3 hashes the TLS ClientHello; JA4, from FoxIO (created by John Althouse), sorts the ClientHello extensions, which "reduces the number of unique fingerprints for modern browsers," and has an `a_b_c` format whose sections can be matched separately. JA4 is BSD 3-Clause "same as JA3"; the rest of the JA4+ suite (server, HTTP, certificate, SSH and TCP fingerprints) is under the FoxIO License 1.1, which bars monetization without an OEM license, a licensing fact a provider building fingerprint products has to check. Cloudflare exposes JA3 and JA4 to Enterprise Bot Management customers, plus JA4 signals (ratios, ranks and quantiles of how a fingerprint behaves across the network over an hour); AWS and Cloud Armor accept JA3 and JA4 as rate-limit keys; Azure Front Door Premium groups rate limits by JA4 (in preview). The common use: a mobile app's traffic shares one fingerprint, so allow that fingerprint and challenge the rest.

**Verified bots** are the allowlist. Cloudflare defines one as "transparent about who it is and what it does," verified by IP validation (a published IP list with a stable user agent, or reverse DNS) or by Web Bot Auth signatures, and well behaved: it must respect robots.txt and crawl directives and keep request rates reasonable; an AI crawler ignoring `crawl-delay` is its example of grounds for removal. Categories describe behavior (search, agent, training, monitoring, feed fetching and others), and operators are labeled direct or intermediary. AWS labels verified bots `bot:verified`, uses only the request's source IP to verify them (bots behind a proxy need an explicit rule), and treats user-triggered agents like unverified bots. Azure's bot rule set sorts traffic into Bad, Good and Unknown and blocks, allows and logs them by default. A bot that claims to be Googlebot from an IP Google doesn't publish is the easiest bad bot to catch, which is why verification is about the IP or the signature, never the User-Agent.

The playbook covers the application side: [fairness and bots](/docs/architecture/admission-control#fairness-and-bots) for queues and drops, and [API6:2023 Unrestricted Access to Sensitive Business Flows](/docs/security/api-security#api6-2023-unrestricted-access-to-sensitive-business-flows) for flows bots abuse.

## Account Takeover at the Edge

Credential stuffing (logins with username and password pairs leaked elsewhere) is a bot problem on one endpoint, and edge providers sell it as a product. AWS WAF's account takeover prevention (ATP) rule group inspects login requests to a configured endpoint, checks email and password combinations "against its stolen credential database, which is updated regularly," and aggregates by IP and client session: more than 20 login requests from an IP in 10 minutes is high volume and blocked, as is more than 20 per session in 30 minutes. On CloudFront it also inspects the application's responses asynchronously to count failures, blocking IPs or sessions with more than 10 failed logins in their window, and it labels username traversal, password traversal and long sessions. Its sibling, account creation fraud prevention (ACFP), does the same for sign-ups. Cloudflare's equivalent is leaked credentials detection, which replaced its deprecated Exposed Credentials Check. The edge has the advantage of seeing a login attempt across many customers; the cost is that the login body has to be inspected by a third party.

## AI Crawlers and Pay per Crawl

robots.txt is 32 years old and was standardized only in September 2022, as RFC 9309. Its rules "are not a form of access authorization": a crawler should cache the file for no more than 24 hours, parse at least 500 KiB of it, treat a 4xx as permission to crawl and a 5xx as "complete disallow." For search engines that bargain held because crawling returned traffic. AI crawlers changed the ratio. Cloudflare's 2025 Radar review found AI bots averaging 4.2% of HTML requests (Googlebot alone 4.5%), with crawl-to-refer ratios reaching 500,000 to 1 for Anthropic and 3,700 to 1 for OpenAI against a peak of 30 to 1 for Google, and crawling for training "as much as 7-8x search crawling" at peak.

The edge responses came in three steps:

1. **Block.** On 3 Jul 2024 Cloudflare offered one-click blocking of AI scrapers to every customer, including Free, reporting that AI bots reached about 39% of the top million properties on its network in June while only 2.98% of them blocked or challenged those bots. AWS's Bot Control has a `CategoryAI` rule that blocks AI bots whether verified or not.
2. **Default to permission.** On 1 Jul 2025 Cloudflare began asking "every new domain" whether to allow AI crawlers, "block[ing] AI crawlers accessing content without permission or compensation, by default."
3. **Charge.** Pay per crawl (1 Jul 2025, private beta) lets a publisher set Allow, Charge or Block per crawler and a flat per-request price per domain. A crawler asking for a charged URL gets `402 Payment Required` with a `crawler-price` header and can retry with `crawler-exact-price`, or send `crawler-max-price` up front and receive `200` with `crawler-charged` if the price fits. Cloudflare "acts as the Merchant of Record." AWS WAF now sells the same idea as **AI traffic monetization** on CloudFront: a monetized resource returns 402 "containing pricing and accepted payment networks," the client submits a signed payment authorization, and settlement runs through third-party facilitators "on-chain," at no charge beyond standard AWS WAF pricing.

Charging requires knowing who the crawler is, and a User-Agent proves nothing. **Web Bot Auth** signs each request with [HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421.html) (RFC 9421, February 2024, which defines the `Signature-Input` and `Signature` fields and parameters such as `created`, `expires`, `keyid` and `tag`). Cloudflare's profile requires Ed25519 keys published as a JSON Web Key Set at `/.well-known/http-message-signatures-directory` (itself signed), a `tag="web-bot-auth"`, a `keyid` that is the key's JWK thumbprint, short expiry (about a minute), `@authority` among the covered components, and a `Signature-Agent` header naming the directory; the directory format and architecture are Internet-Drafts as of October 2026. AWS's Bot Control labels requests `web_bot_auth:verified`, `invalid`, `expired` or `unknown_bot`, and a verified signature exempts the bot from token and category rules. Two vendors verifying the same signature scheme is what makes it a standard a crawler can implement once.

## Rate Limiting at the Edge

The algorithms (fixed window, sliding window, token bucket) and what to key on are the playbook's ([Choosing an Algorithm](/docs/requests/rate-limiting#choosing-an-algorithm), [What to Key On](/docs/requests/rate-limiting#what-to-key-on)), as is the API view ([API4:2023 Unrestricted Resource Consumption](/docs/security/api-security#api4-2023-unrestricted-resource-consumption)). What the edge adds is distribution and scale, and the vendors' documentation is candid about the consequences.

A rate-limit rule at the edge has the same parts everywhere: an expression for which requests count, **characteristics** (the key: IP, IP with NAT support, ASN, country, header, cookie, query, path, JA3/JA4, a JSON body field), a **period**, a **threshold**, an **action** and a **mitigation timeout** (how long the action lasts once triggered). Cloudflare's periods run from 10 seconds to 65,535 by plan, and timeouts up to a day. AWS's evaluation window is 60, 120, 300 (default) or 600 seconds with a minimum limit of 10, and keys combine source or forwarded IP, ASN, headers, cookies, query arguments, path, method, labels and JA3/JA4. Cloud Armor's intervals run from 10 to 3,600 seconds, with up to three keys combined.

Three properties of edge counters change how a limit should be written:

- **Counters are local.** Cloudflare: "Cloudflare does not support global rate limiting counters across the entire network. Each data center maintains its own counters," with the data center ID a mandatory characteristic. Cloud Armor applies thresholds separately in each region, so total traffic can reach a multiple of the limit. A limit of 100 a minute is 100 a minute per location a client's traffic reaches.
- **Counters lag.** Cloudflare allows "a delay of up to a few seconds between detecting a request and updating rate counters." AWS estimates the rate "using an algorithm that gives more importance to more recent requests," doesn't "guarantee an exact limit match," can take "up to several minutes" (usually under 30 seconds) to start or stop limiting, and resets counts for up to a minute when a rule's settings change. Google recommends rate limiting "for abuse mitigation and availability, not for strict quotas or licensing."
- **Keys lie.** A source IP behind a proxy is the proxy's; a forwarded-IP header "can be modified to bypass inspection" (AWS); thousands of mobile users share a carrier NAT. Cloudflare's "IP with NAT support" characteristic, ASN keys and JA4 keys exist because IP alone over- and under-counts.

The consequence is a rule I hold firmly: an edge rate limit is for abuse and availability, and a contractual quota (API calls in a plan, requests a customer paid for) is counted at the origin against the account, as the playbook's rate limiting doc describes. **Throttle versus block** is the other design choice: Cloud Armor's `throttle` allows requests up to the limit and applies the exceed action only to the excess, while `rate_based_ban` applies it to every request from the client until the interval ends plus a ban duration (and a ban rule can't later become a throttle); Cloudflare's throttle behavior is Enterprise only, and its default applies the action for the whole mitigation timeout. Cloud Armor recommends returning 429; the playbook's [headers](/docs/requests/rate-limiting#headers) section covers `Retry-After` and the IETF `RateLimit` fields, whose draft was at version -11 (23 May 2026) and still an Internet-Draft as of October 2026.

## Plan Gating and Pricing

Edge security is the clearest example of plan gating as product design: the same engine on every plan, with counts, periods, fields and actions unlocked by tier. Cloudflare's rate limiting table, as of October 2026:

| Plan | Rules | Characteristics | Periods | Timeouts | Throttle |
| --- | --- | --- | --- | --- | --- |
| Free | 1 | IP | 10 s | 10 s | No |
| Pro | 2 | IP | Up to 1 min | Up to 1 h | No |
| Business | 5 | IP; IP with NAT support; custom counting expressions | Up to 10 min | Up to 1 day | No |
| Enterprise with app security | 100 (by contract) | As Business | Up to 65,535 s | Up to 1 day | Yes |
| Enterprise with Advanced Rate Limiting | 100 | Adds query, host, headers, cookie, ASN, country, path, JA3/JA4, body fields; complexity-score counting | Up to 65,535 s | Up to 1 day | Yes |

Custom WAF rules follow the same ladder (5, 20, 100 and 1,000 per zone), managed and OWASP rulesets start at Pro with a free ruleset for everyone, the Log action is Enterprise only, and granular bot scores and JA3/JA4 are Enterprise Bot Management. The gates sit on the features that cost the provider most to run or that large customers value most (more rules, longer windows, body inspection, fingerprints), and the free tier still gets protection against widely exploited vulnerabilities, which also protects the provider's network from compromised free sites.

AWS prices the same capabilities per unit, as of October 2026:

| Item | Price |
| --- | --- |
| Web ACL | $5.00 a month |
| Rule or rule group (including managed) | $1.00 a month each |
| Requests inspected | $0.60 per million |
| Capacity above 1,500 WCUs | $0.20 per million requests per extra 500 WCUs |
| Body inspection above 16 KB | $0.30 per million requests per extra 16 KB |
| Bot Control, Common | $10 a month per web ACL; first 10 million requests free, then $1 per million |
| Bot Control, Targeted | $10 a month; first 1 million free, then $10 per million |
| ATP and ACFP | $10 a month each per web ACL, plus tiered request fees starting at $1,000 per million |
| CAPTCHA | $0.40 per 1,000 attempts |

The base prices are the same as at the October 2015 launch. Shield Advanced subscribers get standard WAF fees covered on protected resources, but not Bot Control, CAPTCHA, extra WCUs or larger body inspection ([DDoS Mitigation](/books/hosting-and-cloud/ddos-mitigation#attack-traffic-and-the-bill)).

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost shape | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Edge WAF with managed rules** (Cloudflare, Akamai, Fastly, CloudFront with AWS WAF, Cloud Armor, Front Door) | Provider-written rules in the proxy, customer overrides | Virtual patches within hours, often before disclosure; no servers to run | A provider's bad push is everyone's outage; body inspection limits; false positives on unusual apps | Proprietary services | Plan tiers or per rule and request | Most public web applications |
| **Self-run open-source WAF** (ModSecurity with OWASP CRS) | Engine and rules in the customer's proxy | Full control, inspect anything, no third party sees traffic | Tuning work; the customer ships every rule update; no network-wide signal | ModSecurity Apache-2.0 (OWASP since 2024); CRS Apache-2.0 | Servers and staff | Teams with compliance or data-residency reasons, and providers building their own WAF |
| **Agent or module WAF** (Fastly Next-Gen WAF agent) | Inspection inside the application host, managed from a cloud console | Sees decrypted traffic and app context; works off-CDN | An agent on every host; version drift | Proprietary | Contracted | Enterprises with mixed hosting |
| **Bot management by score** (Cloudflare, Akamai, AWS Targeted, Azure) | Per-request automation likelihood plus verified lists | Invisible to most users; adapts | Scores fail closed or open on bad model files (Nov 2025); vendor-specific scales | Proprietary | Enterprise tiers or per request | Retail, ticketing, travel, login pages |
| **Challenges and attestation** (Turnstile, reCAPTCHA, Private Access Tokens) | Ask the client to prove something | Works on any host; simple | Accessibility; solver services; platform dependence | Proprietary services; Privacy Pass is an IETF standard | Free to per-attempt | Forms, sign-ups, comments |
| **Origin rate limiting** (the playbook's Redis pattern) | Exact counters per account at the origin | Precise, contractual | Origin pays for every request it rejects | Own code | Store and compute | APIs with paid quotas |

## My Default

My default for a public web application is an edge WAF with the provider's managed ruleset following the latest version in its default actions, the CRS-based ruleset at paranoia level 1 in log mode for two weeks and then enforcing, custom rules only for what the application knows (admin paths by IP, methods it doesn't serve), and an edge rate limit per IP-with-NAT on login, sign-up and search endpoints sized for abuse, not for quotas. Contractual quotas live at the origin. Bot scoring goes on the few flows bots profit from (login, checkout, inventory), with a challenge rather than a block in the uncertain band, and verified bots allowed by signature or IP, never by User-Agent. That gets virtual patches for free, keeps false positives visible before they block anyone, and puts precise counting where precision matters.

For a provider building this, my default is that every rule, model file and config change goes through staged rollout with health checks and a per-rule kill switch, including emergency rules, with the emergency path compressing the stages rather than skipping them. The tradeoff that would change the application default is data sensitivity: if a third party may not see request bodies (some regulated payloads), I'd run ModSecurity with CRS in my own proxy and accept slower rule updates; PCI DSS 4.0's requirement 6.4.2 for public-facing web applications is satisfied either way ([PCI DSS](/docs/compliance/pci-dss#operating-the-cardholder-data-environment)).

## How to Build It

The chapter adds `waf_rulesets`, `waf_ruleset_versions`, `waf_rules`, `zone_rulesets`, `rule_deployments`, `rule_deployment_stages`, `rate_limit_rules`, `verified_bots` and `crawler_policies`, plus security meters, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Rules attach to `cdn_zones` from [The Edge Business](/books/hosting-and-cloud/edge-business#how-to-build-it); stages run on `edge_locations` from [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#how-to-build-it).

```sql
CREATE TABLE waf_rulesets (              -- a named, versioned set of rules
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID REFERENCES accounts (id),  -- null: provider-managed
  source           TEXT NOT NULL CHECK (source IN ('provider_managed', 'third_party',
                     'customer')),
  vendor           TEXT,                 -- the seller, for third-party rulesets
  code             TEXT NOT NULL,        -- 'managed', 'owasp_crs', 'free_managed', 'ddos_http'
  phase            TEXT NOT NULL CHECK (phase IN ('request', 'response', 'rate_limit',
                     'bot', 'ddos')),
  sku_id           UUID REFERENCES skus (id),     -- monthly charge, where it has one
  CHECK ((source = 'customer') = (account_id IS NOT NULL))
);

CREATE TABLE waf_ruleset_versions (      -- a published, immutable version
  ruleset_id       UUID NOT NULL REFERENCES waf_rulesets (id),
  version          TEXT NOT NULL,
  published_at     TIMESTAMPTZ,          -- null until fully rolled out
  emergency        BOOLEAN NOT NULL DEFAULT FALSE,
  cve_ids          TEXT[] NOT NULL DEFAULT '{}',  -- e.g. '{CVE-2025-55182}'
  changelog        TEXT NOT NULL,
  PRIMARY KEY (ruleset_id, version)
);

CREATE TABLE waf_rules (                 -- one rule inside one ruleset version
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  ruleset_id       UUID NOT NULL,
  version          TEXT NOT NULL,
  rule_ref         TEXT NOT NULL,        -- stable across versions, quoted in logs
  expression       TEXT NOT NULL,        -- in the provider's rules language
  action           TEXT NOT NULL CHECK (action IN ('block', 'managed_challenge',
                     'js_challenge', 'captcha', 'log', 'skip', 'score')),
  anomaly_score    SMALLINT,             -- for action = 'score' (CRS-style)
  paranoia_level   SMALLINT CHECK (paranoia_level BETWEEN 1 AND 4),
  priority         INT NOT NULL,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  max_cpu_micros   INT,                  -- measured budget per request; the 2019 lesson
  FOREIGN KEY (ruleset_id, version) REFERENCES waf_ruleset_versions (ruleset_id, version),
  UNIQUE (ruleset_id, version, rule_ref),
  CHECK ((action = 'score') = (anomaly_score IS NOT NULL))
);

CREATE TABLE zone_rulesets (             -- a zone's use of a ruleset, with its overrides
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id          UUID NOT NULL REFERENCES cdn_zones (resource_id),
  ruleset_id       UUID NOT NULL REFERENCES waf_rulesets (id),
  pinned_version   TEXT,                 -- null: follow the latest published version
  mode             TEXT NOT NULL CHECK (mode IN ('log', 'enforce')),
  score_threshold  SMALLINT,             -- for anomaly-scored rulesets
  paranoia_level   SMALLINT,
  overrides        JSONB NOT NULL DEFAULT '[]',  -- by ruleset, tag or rule_ref: action, enabled
  exceptions       JSONB NOT NULL DEFAULT '[]',  -- skip rules for an expression
  valid_during     TSTZRANGE NOT NULL,
  created_by       TEXT NOT NULL,
  EXCLUDE USING GIST (cdn_zone_id WITH =, ruleset_id WITH =, valid_during WITH &&)
);

CREATE TABLE rule_deployments (          -- shipping one ruleset version or config change
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  ruleset_id       UUID,
  version          TEXT,
  config_ref       TEXT,                 -- for non-rule data: a bot model file, a kill switch
  emergency        BOOLEAN NOT NULL DEFAULT FALSE,
  requested_by     TEXT NOT NULL,
  approved_by      TEXT,                 -- second person, required for emergency pushes
  status           TEXT NOT NULL CHECK (status IN ('staging', 'completed', 'halted',
                     'rolled_back')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (ruleset_id, version) REFERENCES waf_ruleset_versions (ruleset_id, version),
  CHECK (num_nonnulls(version, config_ref) = 1),
  CHECK (NOT emergency OR approved_by IS NOT NULL)
);

CREATE TABLE rule_deployment_stages (    -- each step of the rollout, in order
  deployment_id    UUID NOT NULL REFERENCES rule_deployments (id),
  stage_no         SMALLINT NOT NULL,
  edge_location_id TEXT REFERENCES edge_locations (id),  -- null: every location
  traffic_percent  NUMERIC(5,2) NOT NULL CHECK (traffic_percent > 0
                     AND traffic_percent <= 100),
  mode             TEXT NOT NULL CHECK (mode IN ('log', 'enforce')),
  started_at       TIMESTAMPTZ,
  health_passed_at TIMESTAMPTZ,          -- error rate, CPU and match rate within bounds
  completed_at     TIMESTAMPTZ,
  rolled_back_at   TIMESTAMPTZ,
  PRIMARY KEY (deployment_id, stage_no)
);

CREATE TABLE rate_limit_rules (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id            UUID NOT NULL REFERENCES cdn_zones (resource_id),
  expression         TEXT NOT NULL,      -- which requests count
  characteristics    TEXT[] NOT NULL,    -- 'ip', 'ip_nat', 'asn', 'country', 'ja4',
                                         -- 'header:<name>', 'cookie:<name>', 'path'
  period_seconds     INT NOT NULL CHECK (period_seconds > 0),
  threshold          INT NOT NULL CHECK (threshold > 0),
  counting           TEXT NOT NULL DEFAULT 'requests' CHECK (counting IN ('requests',
                       'complexity_score')),
  action             TEXT NOT NULL CHECK (action IN ('block', 'managed_challenge',
                       'log', 'throttle')),
  timeout_seconds    INT NOT NULL CHECK (timeout_seconds >= 0),  -- the mitigation timeout
  counter_scope      TEXT NOT NULL DEFAULT 'per_location' CHECK (counter_scope IN
                       ('per_location', 'per_region', 'global')),
  response_status    SMALLINT NOT NULL DEFAULT 429,
  priority           INT NOT NULL,
  valid_during       TSTZRANGE NOT NULL
);

CREATE TABLE verified_bots (             -- the allowlist, and how each bot proves itself
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  name               TEXT NOT NULL UNIQUE,  -- 'googlebot', a crawler's product token
  operator           TEXT NOT NULL,
  operator_kind      TEXT NOT NULL CHECK (operator_kind IN ('direct', 'intermediary')),
  categories         TEXT[] NOT NULL,    -- 'search', 'training', 'agent', 'monitoring'
  verification       TEXT NOT NULL CHECK (verification IN ('ip_list', 'reverse_dns',
                       'web_bot_auth')),
  key_directory_url  TEXT,               -- for web_bot_auth
  billing_account_id UUID REFERENCES accounts (id),  -- set when it pays for crawls
  status             TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected',
                       'removed')),
  CHECK ((verification = 'web_bot_auth') = (key_directory_url IS NOT NULL))
);

CREATE TABLE crawler_policies (          -- a zone's choice per crawler
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id            UUID NOT NULL REFERENCES cdn_zones (resource_id),
  verified_bot_id    UUID REFERENCES verified_bots (id),  -- null: unverified AI crawlers
  decision           TEXT NOT NULL CHECK (decision IN ('allow', 'charge', 'block')),
  currency           CHAR(3),
  price_per_request  NUMERIC(24,12),     -- minor units, a flat price per domain
  valid_during       TSTZRANGE NOT NULL,
  CHECK ((decision = 'charge') = (price_per_request IS NOT NULL AND currency IS NOT NULL)),
  EXCLUDE USING GIST ((COALESCE(verified_bot_id::text, '')) WITH =, cdn_zone_id WITH =,
    valid_during WITH &&)
);
```

The meters, all `usage_events.meter` values rated by SKUs in the core catalog:

| Meter | Unit | Counted when |
| --- | --- | --- |
| `waf.requests_inspected` | request | Each request evaluated by a zone's WAF rules, whatever the outcome |
| `waf.capacity_units` | request | Requests times capacity above the included amount (the WCU model) |
| `waf.body_inspection_bytes` | request | Requests whose inspected body exceeds the included size, per extra increment |
| `bot.requests_scored` | request | Each request given a bot score or bot-control evaluation |
| `challenge.attempts` | request | Each CAPTCHA attempt (AWS prices per 1,000) |
| `atp.login_requests` | request | Each login or sign-up request inspected by account-takeover rules |
| `crawl.charged_requests` | request | Each `200` served to a crawler under a `charge` policy, at the policy's price |

Paid crawls are a marketplace flow: the crawler's account is billed through a SKU with `pass_through = 'marketplace_vendor'`, and the publisher is paid out, so the provider's fee and the publisher's revenue stay separable, the same rule as any other pass-through in the core model.

Plan gating is quotas, not code. A new rate-limit rule is checked against the plan's limits before it's accepted:

```sql
-- Can this zone's account add a rate-limit rule with this period and key?
SELECT
  (SELECT COUNT(*) FROM rate_limit_rules r
   WHERE r.cdn_zone_id = $1 AND r.valid_during @> NOW())
     < q_rules.limit_value                                AS under_rule_count,
  $2::int <= q_period.limit_value                         AS period_allowed,
  $3::text[] <@ ARRAY(SELECT jsonb_array_elements_text(  -- feature lists ride on the plan
                 pv.included -> 'ratelimit.characteristics'))   AS characteristics_allowed
FROM resources z
JOIN subscriptions s   ON s.id = z.subscription_id
JOIN plan_versions pv  ON pv.id = s.plan_version_id
JOIN quotas q_rules    ON q_rules.account_id = z.account_id
                      AND q_rules.quota_code = 'ratelimit.rules'
                      AND q_rules.valid_during @> NOW()
JOIN quotas q_period   ON q_period.account_id = z.account_id
                      AND q_period.quota_code = 'ratelimit.max_period_seconds'
                      AND q_period.valid_during @> NOW()
WHERE z.id = $1;
```

And the rollout rule is a query that should always return nothing: a deployment that reached every location without a passed health check on an earlier stage.

```sql
-- Deployments that went global without a healthy earlier stage (should be empty)
SELECT d.id, d.ruleset_id, d.version, d.config_ref, d.emergency
FROM rule_deployments d
JOIN rule_deployment_stages g ON g.deployment_id = d.id
 AND g.edge_location_id IS NULL AND g.traffic_percent = 100 AND g.started_at IS NOT NULL
WHERE NOT EXISTS (
  SELECT 1 FROM rule_deployment_stages e
  WHERE e.deployment_id = d.id AND e.stage_no < g.stage_no
    AND e.health_passed_at IS NOT NULL AND e.health_passed_at <= g.started_at);
```

Notes on the sketch:

- **A ruleset version is immutable and dated.** Rules belong to a version; a zone follows the latest or pins one, so "which rule blocked this request on 10 Dec" is a join on the version in effect, and a pinned zone shows up in a query when an emergency version ships.
- **Every deploy is staged, including emergencies and non-rule data.** `config_ref` covers bot model files and kill-switch flips, the two changes behind the 2025 outages; an emergency deployment needs a second approver and may compress stages but not skip them.
- **Rules carry a cost budget.** `max_cpu_micros` is measured in a test stage before a rule may enforce, the profiling the 2019 remediation added.
- **Rate-limit scope is stated.** `counter_scope` says whether counts are per location, per region or global, so documentation and support can tell a customer what "100 a minute" means.
- **Overrides are rows over time.** `zone_rulesets` is effective-dated with an exclusion constraint, so a customer's change to a threshold or paranoia level is history, not an edit.
- **Decision logs name the rule.** Each security event in the log store carries `rule_ref`, ruleset and version, and the deployment id in effect.
- **Events:** `waf.ruleset_published`, `waf.deployment_staged`, `waf.deployment_rolled_back`, `zone.ruleset_changed`, `ratelimit.rule_changed` and `crawler.policy_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Every ruleset version and deployment.** Who wrote it, who approved it, each stage with its health result, and every rollback, because the provider's post-mortem and a customer's incident review start there.
- **Which rule decided.** For a blocked request, the rule reference, ruleset version, mode and zone override in effect, so a false positive can be explained to the customer and fixed.
- **Zone overrides and exceptions over time.** A customer who disabled a rule and was then exploited through it will ask when and by whom.
- **Emergency rules against CVEs.** The CVE, when the rule shipped, its default action and when the customer's zone received it, which is the evidence for a compensating control in a vulnerability-management or PCI review.
- **Crawler policies and charges.** Each policy change, each charged request and each payout, reconcilable to the publisher's statement.
- **Verified-bot decisions.** Why a bot was verified or removed, so an operator disputing removal gets a reason.

## What This Means for the System You Build

- **Ship rules as versioned data** with a log mode, overrides and exceptions, and record which rule and version decided each request.
- **Stage every global push,** rules, models and config alike, with health checks, a per-rule kill switch and validation of generated files against their limits.
- **Treat log mode as a decision test, not a safety test;** budget each rule's CPU before it runs anywhere.
- **Virtual-patch fast and patch anyway.** Ship emergency rules in the free tier too, and tell customers the rule is a bridge.
- **Verify bots by signature or IP, never by User-Agent,** and normalize vendor bot scores before writing rules against them.
- **Use edge rate limits for abuse, origin counters for quotas,** and state whether counters are per location.
- **Gate by quota rows,** so plans change without code and a refused rule can quote the limit.

## References

**Standards and specifications**

- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html), September 2022, the 1994 origin, caching, parsing limits and status handling
- [RFC 9421: HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421.html), February 2024, `Signature-Input`, `Signature` and signature parameters
- [RFC 9576: The Privacy Pass Architecture](https://www.rfc-editor.org/rfc/rfc9576.html), June 2024, the Client, Attester, Issuer and Origin roles, and RFCs 9577 and 9578
- [IETF: RateLimit header fields for HTTP](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), version -11 of 23 May 2026 and its draft status
- [OWASP CRS: Anomaly scoring](https://coreruleset.org/docs/2-how-crs-works/2-1-anomaly_scoring/), severity scores, thresholds and decoupled blocking
- [OWASP CRS: Paranoia levels](https://coreruleset.org/docs/2-how-crs-works/2-2-paranoia_levels/), the four levels and executing versus blocking levels
- [OWASP CRS: Documentation](https://coreruleset.org/docs/), what CRS is and its Apache 2.0 license

**History**

- [Carnegie Mellon and IBM: CAPTCHA, Using Hard AI Problems for Security (EUROCRYPT 2003)](https://courses.cs.duke.edu/spring07/cps296.3/captcha_crypt.pdf), the definition and the 1999 Slashdot poll (course-hosted copy of the paper, DOI 10.1007/3-540-39200-9_18)
- [Google: Teaching computers to read, Google acquires reCAPTCHA](https://googleblog.blogspot.com/2009/09/teaching-computers-to-read-google.html), 16 Sep 2009
- [LWN: ModSecurity and the OWASP Core Rule Set](https://lwn.net/Articles/708475/), Ristić's 2002 Apache module, the rule language and version 3
- [OWASP: ModSecurity custodianship](https://owasp.github.io/blog/2024/01/09/ModSecurity.html), the 9 Jan 2024 move from Trustwave to OWASP
- [OWASP ModSecurity repository](https://github.com/owasp-modsecurity/ModSecurity), libmodsecurity v3, Apache-2.0 and the end of Trustwave's sponsorship on 1 Jul 2024
- [AWS News Blog: New AWS WAF](https://aws.amazon.com/blogs/aws/new-aws-waf/), the 6 Oct 2015 launch, actions and launch prices
- [SEC: Fastly completes acquisition of Signal Sciences (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1517413/000151741320000218/projectgriffon-closing1.htm), 1 Oct 2020

**WAF products**

- [Cloudflare WAF: Managed rules](https://developers.cloudflare.com/waf/managed-rules/), rulesets, plan availability, overrides and exceptions
- [Cloudflare WAF: OWASP Core Ruleset concepts](https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/concepts/), paranoia levels, threat score and thresholds
- [Cloudflare WAF: Custom rules](https://developers.cloudflare.com/waf/custom-rules/), expressions, actions, Log on Enterprise and rule counts by plan
- [AWS WAF: How AWS WAF works](https://docs.aws.amazon.com/waf/latest/developerguide/how-aws-waf-works.html), web ACLs, rules, rule groups, WCUs and actions
- [AWS WAF: Pricing](https://aws.amazon.com/waf/pricing/), web ACL, rule, request, WCU, body, Bot Control, fraud control and CAPTCHA prices
- [Google Cloud Armor: Overview](https://docs.cloud.google.com/armor/docs/cloud-armor-overview), preconfigured WAF rules based on CRS versions
- [Google Cloud Armor: Security policy overview](https://docs.cloud.google.com/armor/docs/security-policy-overview), policy types, priority order, actions and preview mode
- [Microsoft Learn: Azure Web Application Firewall on Azure Front Door](https://learn.microsoft.com/en-us/azure/web-application-firewall/afds/afds-overview), modes, actions, rule order, Default Rule Set, bot rule set and rate limits
- [Akamai: App & API Protector](https://www.akamai.com/products/app-and-api-protector), adaptive engine and automatic updates
- [Fastly: About the protection mode](https://www.fastly.com/documentation/guides/next-gen-waf/about-the-protection-mode/), Blocking, Logging and Off, and the 406 response
- [Bunny: Shield](https://bunny.net/docs/shield), WAF, rate limiting and bot detection in one product

**Emergency rules and rollout**

- [Cloudflare: CVE-2021-44228, Log4j RCE 0-day mitigation](https://blog.cloudflare.com/cve-2021-44228-log4j-rce-0-day-mitigation/), the three rules of 10 Dec 2021
- [Google Cloud: Cloud Armor WAF rule to help address Apache Log4j vulnerability](https://cloud.google.com/blog/products/identity-security/cloud-armor-waf-rule-to-help-address-apache-log4j-vulnerability), the `cve-canary` rule, 11 Dec 2021
- [AWS: Security bulletin AWS-2021-006](https://aws.amazon.com/security/security-bulletins/AWS-2021-006/), managed rule groups for Log4j and update guidance
- [Cloudflare: WAF proactively protects against React vulnerability](https://blog.cloudflare.com/waf-rules-react-vulnerability/), CVE-2025-55182 rules deployed 2 Dec 2025 before disclosure
- [Cloudflare: Details of the Cloudflare outage on July 2, 2019](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/), the regex, simulate mode, Quicksilver, the timeline and remediation
- [Cloudflare: 18 November 2025 outage](https://blog.cloudflare.com/18-november-2025-outage/), the bot feature file, the 200-feature limit and remediation
- [Cloudflare: 5 December 2025 outage](https://blog.cloudflare.com/5-december-2025-outage/), the body buffer change, the global configuration system and remediation

**Bots and account takeover**

- [Cloudflare: Bot scores](https://developers.cloudflare.com/bots/concepts/bot-score/), the 1 to 99 scale, score 0, engines and plan access
- [Cloudflare: JA3/JA4 fingerprint](https://developers.cloudflare.com/bots/additional-configurations/ja3-ja4-fingerprint/), fingerprints, JA4 signals and Enterprise availability
- [FoxIO: JA4+](https://github.com/FoxIO-LLC/ja4), the suite, its author, format and licenses
- [Cloudflare: Verified bots](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/), verification methods, behavior requirements and categories
- [Cloudflare: Web Bot Auth](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/), key directory, signing requirements and the drafts
- [AWS WAF: Bot Control rule group](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-bot.html), protection levels, labels, Web Bot Auth status, token-reuse and volumetric rules
- [AWS WAF: Account takeover prevention rule group](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-atp.html), stolen-credential checks, thresholds and response inspection
- [Akamai: Bot Manager](https://www.akamai.com/products/bot-manager), the 0 to 100 score, response tiers and stealthy defenses
- [Cloudflare: Turnstile](https://blog.cloudflare.com/turnstile-private-captcha-alternative/), the 28 Sep 2022 launch, challenge types and the CAPTCHA-time quote
- [Cloudflare: Eliminating CAPTCHAs on iPhones and Macs](https://blog.cloudflare.com/eliminating-captchas-on-iphones-and-macs-using-new-standard/), Private Access Tokens, 8 Jun 2022, and the roles

**AI crawlers**

- [Cloudflare: Declare your AIndependence](https://blog.cloudflare.com/declaring-your-aindependence-block-ai-bots-scrapers-and-crawlers-with-a-single-click/), one-click blocking for all plans, 3 Jul 2024, and crawler reach
- [Cloudflare: Content Independence Day](https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/), the 1 Jul 2025 default change
- [Cloudflare press release: AI crawlers blocked by default](https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/), new domains asked whether to allow AI crawlers
- [Cloudflare: Introducing pay per crawl](https://blog.cloudflare.com/introducing-pay-per-crawl/), Allow, Charge and Block, the 402 flow, price headers, Web Bot Auth and merchant of record
- [Cloudflare: Radar 2025 Year in Review](https://blog.cloudflare.com/radar-2025-year-in-review/), AI bot and Googlebot shares, crawl-to-refer ratios and crawl purposes
- [AWS WAF: AI traffic monetization](https://docs.aws.amazon.com/waf/latest/developerguide/waf-ai-traffic-monetization.html), 402 responses, signed payment authorizations and settlement

**Rate limiting**

- [Cloudflare WAF: Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/), parameters, the plan table, periods and the counter delay
- [Cloudflare WAF: How Cloudflare determines the request rate](https://developers.cloudflare.com/waf/rate-limiting-rules/request-rate/), per data center counters and complexity scores
- [AWS WAF: Rate-based rule statements](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html), instances and WCU cost
- [AWS WAF: Rate-based rule high-level settings](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based-high-level-settings.html), evaluation windows, minimum limit and actions
- [AWS WAF: Rate-based rule caveats](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based-caveats.html), approximation, detection delay and counter resets
- [AWS WAF: Aggregating rate-based rules](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based-aggregation-options.html), aggregation keys and the forwarded-IP caution
- [Google Cloud Armor: Rate limiting overview](https://docs.cloud.google.com/armor/docs/rate-limiting-overview), throttle versus rate-based ban, keys, intervals and per-region enforcement
