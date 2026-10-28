+++
title = "Pipeline Supply-Chain Security"
description = "The CI breaches from SolarWinds to Shai-Hulud and the controls they produced: OIDC federation, pinning, SLSA, Sigstore, trusted publishing and SBOMs."
category = "Hosting & Cloud Industry"
order = 2139
part = "CI/CD Platforms"
tags = ["supply-chain", "security", "ci", "oidc", "slsa", "sbom"]
+++

A build pipeline holds the keys to everything downstream of it: cloud credentials to deploy, registry tokens to publish, signing keys to vouch, and the source to change. Attackers worked that out before most defenders did. The incidents of 2020 to 2026 show the same few moves repeated: tamper with the build itself, steal the secrets in its environment, move a tag that thousands of pipelines trust, or write a workflow into a victim's repository so their own CI does the stealing. Each move produced a control, and the controls now ship as platform features: short-lived federated credentials, policies that require pinned actions, signed provenance from hosted builders, keyless signing with a public log, and registries that accept packages only from a known workflow.

This chapter tells the incidents in order, then the controls and the laws that now ask for them. It adds `workload_identity_bindings` and `artifact_attestations` to the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The pipeline rules (least-privilege tokens, SHA pinning, no secrets for fork pull requests) are the playbook's [Secure](/docs/delivery/ci-pipelines#secure) and [Supply Chain](/docs/engineering/dependencies#supply-chain) sections; image signing and admission are [Trusting What You Run](/docs/delivery/containers#trusting-what-you-run) and [Image Policy](/docs/operations/kubernetes#image-policy); leaked cloud keys and their quarantine are Free-Tier Fraud & Stolen Keys; account takeover response is the [UGP abuse desks](/books/user-generated-platforms/abuse-desks#how-to-build-it) chapter.

## How the Providers Do It

| Incident | When | Move | Control it argued for |
| --- | --- | --- | --- |
| **SolarWinds (SUNSPOT and SUNBURST)** | Orion builds released March to June 2020; CISA alert December 13, 2020 | Malware on the build server swapped one source file during MSBuild and restored it afterward | Hardened, isolated builds with provenance (SLSA Build L3) |
| **Codecov Bash Uploader** | Altered from January 31, 2021; found April 1, 2021 | A credential exposed by a Docker image build let attackers modify a script that sent CI environment variables out | Short-lived credentials; checksum verification; rotate everything in CI |
| **CircleCI** | Laptop compromised December 16, 2022; disclosed January 4, 2023 | A stolen SSO session cookie reached production; encryption keys taken from a running process | Customers rotate all secrets; federated credentials instead of stored ones |
| **tj-actions/changed-files (CVE-2025-30066)** | March 12 to 15, 2025 | Tags repointed at a commit that dumped secrets into logs | SHA pinning and organization policy |
| **GhostAction** | Malicious commits from September 2, 2025; found September 5; resurgence from August 31, 2026 | Workflows pushed into repositories with stolen maintainer access, posting secrets out | Branch protection on workflow files; secret scanning; short-lived tokens |
| **Shai-Hulud, then Shai-Hulud 2.0** | September 2025; November 21 to 23, 2025 | A self-replicating npm worm stealing tokens and republishing victims' packages; the second wave registered infected hosts as self-hosted runners | Trusted publishing, short token lifetimes, phishing-resistant 2FA |

Three patterns run through the table. **The secrets in CI are the target,** more often than the code: four of the six incidents ended in "rotate everything." **Mutable references are the weak joint:** a tag, a script URL or a workflow file that changes without review. **Developer machines and accounts are the way in:** a laptop, a maintainer's token, a session cookie. The controls answer each: credentials that expire in minutes, references that can't move, and builds that prove where an artifact came from.

## The Build as a Target: SolarWinds

CISA's alert of December 13, 2020 covered SolarWinds Orion versions 2019.4 HF5 through 2020.2.1 HF1, released from March to June 2020. CrowdStrike's analysis of SUNSPOT, published January 11, 2021, described malware on the build server that watched for `MsBuild.exe`, read its command line for the Orion solution, replaced `InventoryManager.cs` with a backdoored version during the build, checked MD5 hashes so the build wouldn't fail, and restored the original file afterward; the binary was likely built on February 20, 2020. Nothing in the source repository changed. The case is why provenance has to describe the build environment, not only the commit: a signed artifact from a compromised builder is a signed backdoor.

## Secrets in the Environment: Codecov and CircleCI

Codecov reported that its Bash Uploader script had been altered from January 31, 2021 and that a customer found the change on April 1 by comparing checksums. An error in Codecov's Docker image creation process had exposed the Google Cloud Storage credential used to modify the script, and the altered script sent CI environment variables to a third-party server. Codecov's advice was to run `env` in CI and rotate everything it printed. A script piped from a URL into a shell runs with every secret in the job.

CircleCI's incident report of January 4, 2023 traced a breach to malware, missed by antivirus, on an engineer's laptop on December 16, 2022, which stole a session cookie backed by two-factor SSO; access escalated to production, with reconnaissance on December 19, exfiltration on December 22 and a customer's report on December 29. Customer data was encrypted at rest, but the attacker extracted keys from a running process. CircleCI told customers to rotate every secret stored in the platform and said that anything entered after January 5, 2023 could be considered secure. For a CI provider, the lesson is that stored customer secrets are a liability the provider holds for every customer at once; federated credentials remove most of them.

## Moved Tags and Written Workflows

CISA's alert of March 18, 2025 described `tj-actions/changed-files` (CVE-2025-30066), compromised from 00:00 UTC March 12 to 12:00 UTC March 15, 2025: its tags were moved to a commit that printed access keys, GitHub and npm tokens and private keys into workflow logs, readable in public repositories. It was likely enabled by the compromise of `reviewdog/action-setup@v1` (CVE-2025-30154) on March 11, and was added to CISA's Known Exploited Vulnerabilities catalog on March 26. Workflows pinned to a commit SHA were unaffected. On August 15, 2025 GitHub let organizations block specific actions with `!` entries in the allowed-actions policy and require actions to be pinned to a full SHA, failing unpinned ones.

GitGuardian's report on GhostAction described attackers with maintainer access pushing a workflow named "Github Actions Security" on September 2, 2025 that posted secrets to an outside endpoint: 327 users, 817 repositories and 3,325 secrets (Docker Hub, GitHub, npm, PyPI, AWS, Cloudflare), found on September 5. A resurgence from August 31, 2026 reached 772 repositories, 373 users and 2,577 secrets by GitGuardian's count, and a burst from October 7, 2026 pushed a `security-audit.yml` workflow to hundreds of repositories through compromised accounts; as of October 2026 it is ongoing. A workflow file is code that runs with the repository's secrets, so a write to it is a deployment of an attacker's program.

## Worms in the Registry: Shai-Hulud

GitHub was notified on September 14, 2025 of a self-replicating npm worm that stole tokens and cloud keys and then published infected versions of the victims' other packages; it affected more than 500 packages, and GitHub removed them and blocked uploads carrying its indicators. CISA's alert of September 23, 2025 told users to pin dependencies to releases from before September 16, 2025 and rotate credentials. On September 22 GitHub announced a hardening plan for npm: granular tokens limited to seven days, classic tokens deprecated, TOTP two-factor deprecated in favor of FIDO, and more trusted publishing providers, without dates.

The second wave began as early as November 21, 2025. SentinelOne described it running from a `preinstall` script, registering the infected host as a self-hosted runner named "SHA1HULUD" and writing a workflow for persistence; Check Point counted hundreds of packages and more than 25,000 GitHub repositories between November 21 and 23, with a destructive fallback that could wipe local files; New Zealand's NCSC counted almost 500 packages. Counts range from about 500 to 800 packages by different researchers, and no CISA alert was found for the second wave. A worm that registers runners turns a developer's laptop into part of the victim's CI, which is why runner registration is a privileged act ([Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#auditing)).

## Federated Credentials

The control that removes most stored secrets is workload identity federation. GitHub made OIDC for Actions generally available on November 23, 2021: a job requests a signed token from the platform describing itself (repository, branch, environment, workflow), and a cloud exchanges it for "short-lived access tokens that are automatically rotated for each deployment." The cloud side is a trust policy: accept tokens from this issuer whose subject matches this repository and environment, and grant this role. Nothing long-lived sits in the CI provider's secret store, so a breach like CircleCI's yields tokens that have already expired.

The design points are all in the trust policy: match the full subject (repository and environment, not just the organization), require the audience, bind production roles only to protected environments ([Approvals and Environment Protection](/books/hosting-and-cloud/continuous-delivery-platforms#approvals-and-environment-protection)), and log every exchange. [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#identity-iam-and-api-keys) gives the provider-side rule: temporary credentials over long-lived keys.

## Provenance and Signing

SLSA 1.0, finalized April 19, 2023, defines Build levels: L0 none; L1 provenance exists; L2 a hosted build platform produces signed provenance; L3 a hardened platform where runs are isolated from each other and the signing secret is unreachable from user-defined steps. Version 1.1 was approved April 21, 2025, and 1.2 is the current approved specification. L3 is the SolarWinds answer: a build step can't forge the provenance or reach another build.

Sigstore reached general availability on October 25, 2022: Fulcio, a certificate authority that issues short-lived certificates bound to an OIDC identity, and Rekor, a public transparency log, so cosign can sign "without any keys" held by the signer. The consumer verifies not "signed by key X" but "signed by the workflow at this repository and ref, logged at this time."

## Registries as the Control Point

Public registries turned those pieces into publishing rules. npm added provenance in public beta on April 19, 2023: `npm publish --provenance` from GitHub Actions attaches a Sigstore-signed statement tied to the CI identity, recorded in the public log. PyPI launched trusted publishing around April 20, 2023: a project trusts a specific workflow, and PyPI exchanges that workflow's OIDC token for a short-lived, scoped upload token, GitHub Actions only at first. PyPI's index-hosted attestations (PEP 740) launched November 14, 2024, enabled by default in the official publishing workflow from v1.11.0 with trusted publishing. npm trusted publishing with OIDC became generally available on July 31, 2025, from GitHub-hosted runners and GitLab.com shared runners (not yet self-hosted runners), with provenance automatic except for private source repositories; bulk configuration through `npm trust` followed on February 18, 2026.

For a provider running a registry ([Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries#how-a-registry-works-for-the-operator)), the pattern is: accept publishes from a federated workflow identity instead of a stored token, record provenance with every version, limit token lifetimes, and require phishing-resistant second factors for the humans who can still publish.

## SBOMs and the Law

Governments moved from asking for these practices to, in the EU, requiring some of them.

- **United States.** Executive Order 14028, signed May 12, 2021, tasked NIST with software supply chain guidance, with SBOMs among the workstreams; NIST defined critical software on June 26, 2021 and issued guidance on July 11, 2021. OMB memoranda M-22-18 and M-23-16 then required agencies to collect a secure software development attestation from vendors. OMB's M-26-05 of January 23, 2026, "Adopting a Risk-based Approach to Software and Hardware Security," rescinded them: the attestation form is optional, SBOMs aren't required government-wide though agencies may request them by contract, and inventories are still required. As of October 2026 M-26-05 is in effect.
- **European Union.** The Cyber Resilience Act, Regulation (EU) 2024/2847, entered into force on December 10, 2024. Its rules on conformity assessment bodies apply from June 11, 2026; manufacturers' reporting of actively exploited vulnerabilities and severe incidents through ENISA's single platform (Article 14) from September 11, 2026; and the rest from December 11, 2027, including Annex I's requirement to identify and document components "including by drawing up a software bill of materials in a commonly used and machine-readable format covering at the very least the top-level dependencies." Non-compliance with the essential requirements and Articles 13 and 14 can be fined up to EUR 15 million or 2.5% of worldwide annual turnover, whichever is higher.

For a provider, the CRA makes SBOM generation and vulnerability reporting obligations of its customers who sell products with digital elements in the EU, and features of its own CI and registry products those customers will need: generating SBOMs in the build, storing them as attestations beside the artifact, and producing them on request.

## The Alternatives

| Control | Model | Strengths | Failure modes | Cost and ownership | Who offers it |
| --- | --- | --- | --- | --- | --- |
| **Stored long-lived secrets** | Keys in the CI secret store | Works with anything | Every CI breach becomes a key leak | Free; rotation is manual | Every CI product |
| **OIDC federation** | Short-lived tokens exchanged per job | No stored cloud keys; scoped by repository and environment | Over-broad trust policies (organization-wide subjects) | Free; configuration per cloud | GitHub Actions (generally available November 2021) and other CI products |
| **SHA pinning with policy** | Actions referenced by commit, enforced by organization policy | Moved tags can't reach you | Pins go stale without update automation | Free | GitHub (August 2025 policy); bots keep pins current |
| **Signed provenance** (SLSA L2 and L3) | The build platform signs what it built and how | Consumers verify origin; detects stolen-laptop publishes | L3 needs a hardened, isolated builder | Platform feature | Hosted CI with attestation features |
| **Keyless signing** (Sigstore) | Certificates bound to OIDC identity, public log | No signing keys to steal; auditable | Depends on the identity provider and log availability | Open source, Linux Foundation | cosign, npm, PyPI |
| **Trusted publishing** | Registry accepts uploads only from a named workflow | Removes publish tokens | Workflow compromise still publishes | Registry feature | npm, PyPI |
| **SBOMs** | Component inventory per build | Answers "are we affected" fast; CRA compliance | Inventory without action; format churn | Open tooling | Most CI and scanning vendors |

## My Default

My default is no long-lived cloud or registry credentials in CI at all: OIDC federation bound to repository and protected environment, trusted publishing for packages, actions pinned to SHAs under an organization policy with a bot keeping them current, workflow files under code-owner review, signed provenance from hosted runners for everything published, and an SBOM stored as an attestation beside every release. As a provider, I'd make the federated path the default in the console, show customers which of their pipelines still hold stored keys, and keep secrets out of reach of fork pull requests by construction ([Secure](/docs/delivery/ci-pipelines#secure)).

What would change this: a target that can't accept federated identity (an old system with only static keys), where the fallback is a vault issuing short-lived credentials to the job, and air-gapped builds, where signing keys must be held locally in hardware.

## How to Build It

Two tables. `workload_identity_bindings` is the trust policy that lets a CI job's identity become a role in the provider, extending the [service principals](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it) of the accounts chapter. `artifact_attestations` stores provenance, SBOMs and signatures for artifacts by digest (Voice Platforms owns an `attestations` table for STIR/SHAKEN, so this one is named for what it attests).

```sql
CREATE TABLE workload_identity_bindings (  -- which external workload identities may act as whom
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  service_principal_id UUID NOT NULL REFERENCES service_principals (id),
  issuer               TEXT NOT NULL,    -- 'https://token.actions.githubusercontent.com'
  audience             TEXT NOT NULL,
  subject_pattern      TEXT NOT NULL,    -- e.g. 'repo:org/app:environment:production'
  required_claims      JSONB NOT NULL DEFAULT '{}',  -- ref, workflow, runner environment
  max_token_ttl        INTERVAL NOT NULL CHECK (max_token_ttl <= INTERVAL '12 hours'),
  valid_during         TSTZRANGE NOT NULL,
  created_by           TEXT NOT NULL,    -- typed actor
  CHECK (subject_pattern <> '*' AND subject_pattern NOT LIKE '%:*')  -- no organization-wide wildcards
);

CREATE TABLE workload_token_exchanges (  -- every exchange, granted or refused
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  binding_id      UUID REFERENCES workload_identity_bindings (id),  -- null: no binding matched
  issuer          TEXT NOT NULL,
  subject         TEXT NOT NULL,
  claims_digest   TEXT NOT NULL,         -- hash of the presented claims
  outcome         TEXT NOT NULL CHECK (outcome IN ('granted', 'refused')),
  issued_credential_expires_at TIMESTAMPTZ,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE artifact_attestations (     -- provenance, SBOMs and signatures, by digest
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  subject_digest    TEXT NOT NULL,       -- 'sha256:...' of the image or package
  registry_id       UUID REFERENCES resources (id),        -- kind = 'registry'
  predicate_type    TEXT NOT NULL,       -- SLSA provenance, an SBOM format, a signature
  slsa_build_level  SMALLINT CHECK (slsa_build_level BETWEEN 0 AND 3),
  builder_id        TEXT,                -- the hosted builder that signed it
  source_repository TEXT,
  source_commit     TEXT,
  ci_run_id         UUID REFERENCES ci_runs (id),
  signer_identity   TEXT NOT NULL,       -- the certificate subject, e.g. the workflow ref
  transparency_log_index BIGINT,         -- the log entry, when logged
  envelope_ref      TEXT NOT NULL,       -- where the signed statement is stored
  verified_at       TIMESTAMPTZ,         -- when the provider last verified it
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON artifact_attestations (subject_digest);
```

A deploy gate joins the deployment's digest to its attestations, the check the playbook's [Image Policy](/docs/operations/kubernetes#image-policy) enforces at admission:

```sql
-- Deployments serving now whose artifact lacks verified provenance at Build L2 or above.
SELECT d.id, d.resource_id, d.artifact_digest
FROM deployments d
JOIN deployment_aliases a ON a.deployment_id = d.id AND upper_inf(a.assigned_during)
LEFT JOIN artifact_attestations t
  ON t.subject_digest = d.artifact_digest
 AND t.slsa_build_level >= 2 AND t.verified_at IS NOT NULL
WHERE t.id IS NULL;
```

When a secret leaks, the exposure query runs the other way: every run that had the secret in its environment, from `ci_runs.secrets_exposed`, joined to the environment and window, so rotation covers everything that could have read it.

## Auditing

- **Every identity binding and every token exchange,** granted or refused, because a refused exchange from an unknown repository is an attack in progress and a granted one is the record of who deployed.
- **Every attestation and its verification,** kept for as long as the artifact can run, so "where did this binary come from" has a signed answer.
- **Changes to workflow files and action policies,** with reviewers, as the GhostAction and tj-actions cases make them production changes.
- **Secret rotations after an incident,** linked to the incident and to the runs that exposed each secret.
- **Vulnerability reports and their deadlines,** for customers under the CRA's reporting rules from September 11, 2026.

## What This Means for the System You Build

- **Replace stored CI secrets with federation,** bound to repository and protected environment, never organization-wide.
- **Pin third-party actions to SHAs** and enforce it by policy, with automation to keep pins current.
- **Review workflow files like production code,** with code owners and branch protection.
- **Sign provenance on a hardened builder** and verify it at deploy and admission.
- **Publish packages through trusted publishing,** and keep publish tokens short-lived where they remain.
- **Store SBOMs as attestations by digest,** ready for customers' CRA obligations.
- **Log every token exchange and runner registration,** and treat an unexpected one as an incident.

## References

**Incidents and advisories**

- [CISA: Active exploitation of SolarWinds software](https://www.cisa.gov/news-events/alerts/2020/12/13/active-exploitation-solarwinds-software), December 13, 2020, affected Orion versions
- [CrowdStrike: SUNSPOT malware technical analysis](https://www.crowdstrike.com/blog/sunspot-malware-technical-analysis/), January 11, 2021, the build-time file swap and hash checks
- [Codecov: Security update](https://about.codecov.io/security-update/), the altered Bash Uploader, dates, the exposed credential and the rotation advice
- [CircleCI: January 4, 2023 incident report](https://circleci.com/blog/jan-4-2023-incident-report/), timeline, session cookie theft, keys from a running process, rotation and the January 5 cutoff
- [CISA: Supply chain compromise of tj-actions/changed-files](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-github-action-cve-2025-30066), March 18, 2025, window, exposure, reviewdog link and KEV listing
- [GitGuardian: GhostAction campaign](https://blog.gitguardian.com/ghostaction-campaign-3-325-secrets-stolen/), September 2025, users, repositories and secrets
- [The Hacker News: Credential-stealing GitHub Actions](https://thehackernews.com/2026/10/credential-stealing-github-actions.html), the 2026 resurgence and its counts
- [CISA: Widespread supply chain compromise impacting npm](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem), September 23, 2025, pinning and rotation guidance
- [GitHub: Our plan for a more secure npm supply chain](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/), September 22, 2025, Shai-Hulud response and token and 2FA plans
- [SentinelOne: Defending against Sha1-Hulud, the second coming](https://www.sentinelone.com/blog/defending-against-sha1-hulud-the-second-coming/), the preinstall script and self-hosted runner registration
- [Check Point: Shai-Hulud 2.0](https://blog.checkpoint.com/research/shai-hulud-2-0-inside-the-second-coming-the-most-aggressive-npm-supply-chain-attack-of-2025/), November 21 to 23, 2025 counts and the destructive fallback
- [NCSC New Zealand: Supply chain compromise impacting npm](https://www.ncsc.govt.nz/alerts/supply-chain-compromise-impacting-npm-ecosystem/), almost 500 packages

**Platform controls**

- [GitHub Changelog: Secure cloud deployments with OIDC is now GA](https://github.blog/changelog/2021-11-23-secure-cloud-deployments-with-oidc-is-now-ga/), November 23, 2021
- [GitHub Changelog: Blocking and SHA pinning in actions policy](https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/), August 15, 2025
- [GitHub: Introducing npm package provenance](https://github.blog/security/supply-chain-security/introducing-npm-package-provenance/), April 19, 2023
- [PyPI: Introducing trusted publishers](https://blog.pypi.org/posts/2023-04-20-introducing-trusted-publishers/), April 2023
- [Trail of Bits: Attestations on PyPI](https://blog.trailofbits.com/2024/11/14/attestations-a-new-generation-of-signatures-on-pypi/), November 14, 2024, PEP 740 and the default in the publishing workflow
- [GitHub Changelog: npm trusted publishing with OIDC is generally available](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/), July 31, 2025, supported runners and automatic provenance
- [GitHub Changelog: npm bulk trusted publishing config](https://github.blog/changelog/2026-02-18-npm-bulk-trusted-publishing-config-and-script-security-now-generally-available/), February 18, 2026

**Standards**

- [SLSA: SLSA 1.0 is final](https://slsa.dev/blog/2023/04/slsa-v1-final), April 19, 2023
- [SLSA 1.0: Security levels](https://slsa.dev/spec/v1.0/levels), Build L0 to L3
- [SLSA: Version 1.1](https://slsa.dev/blog/2025/04/slsa-v1.1), approved April 21, 2025
- [SLSA 1.2 specification](https://slsa.dev/spec/v1.2/), the current approved version
- [Sigstore: Sigstore is generally available](https://blog.sigstore.dev/sigstore-ga-ddd6ba67894d/), October 25, 2022, Fulcio, Rekor and keyless signing

**Law and policy**

- [Federal Register: Executive Order 14028](https://www.govinfo.gov/content/pkg/FR-2021-05-17/html/2021-10460.htm), signed May 12, 2021
- [NIST: Executive Order 14028](https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity), the critical software definition, guidance dates and SBOM workstream
- [CyberScoop: OMB rescinds the secure software memo](https://cyberscoop.com/omb-rescinds-burdensome-biden-era-secure-software-memo/), M-26-05 of January 23, 2026 and its effect
- [EUR-Lex: Regulation (EU) 2024/2847 (Cyber Resilience Act)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng), entry into force, application dates, the Annex I SBOM requirement and Article 64 fines
