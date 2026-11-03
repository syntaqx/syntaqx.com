+++
title = "Infrastructure & Employee Access"
nav_title = "Infrastructure Access"
description = "How engineers reach production: SSO for every tool, zero trust over VPNs, device posture, cloud roles, short-lived credentials, just-in-time and break-glass."
category = "Security"
order = 711
tags = ["security", "iam", "zero-trust", "access", "compliance"]
+++

The shortest path to your customers' data usually runs through an employee: their laptop, their browser session, the access key in their home directory, the VPN that puts them on the same network as the database. Attackers know it. In December 2022, malware on one CircleCI engineer's laptop, undetected by antivirus, stole "a valid, 2FA-backed SSO session," and the attacker used it to impersonate the employee and reach production systems ([CircleCI: January 4, 2023 incident report](https://circleci.com/blog/jan-4-2023-incident-report/)). Every control the company had at the front door worked; the session was stolen after it.

This chapter is how people and pipelines reach infrastructure: cloud consoles and APIs, hosts and clusters, databases, internal tools. Staff access to *customer data* through support tooling has its own rules in [Support Access & Internal Tools](/docs/security/support-access), and signing *customers* in through their identity provider is [SSO & Federation](/docs/security/sso-and-federation). The defaults here are the ones auditors expect too, and [SOC 2](/docs/compliance/soc-2#engineering-is-the-evidence) tests most of them as logical access controls.

![A person and a pipeline reaching production. An engineer on a managed device signs in through SSO with phishing-resistant MFA and a device posture check, then makes an access request with a reason, approval and time limit; that path is accented and fans out to three targets: internal tools behind an identity-aware proxy, hosts through a session manager or SSH certificate, and cloud accounts through a role session of 1 to 12 hours. Below, a CI job reaches cloud accounts with an OIDC token per job. A line under everything says every grant, session and command lands in the audit trail.](/diagrams/infrastructure-access-path.svg "Every path into production starts at one identity provider and ends in a short-lived session. Pipelines federate with OIDC instead of holding keys; nothing in the picture is a standing credential.")

## One Identity, SSO for Everything

Every internal system authenticates against one workforce identity provider: the cloud consoles, the code host, CI, the observability stack, the admin panels, the feature flag service, the on-call tool, the internal wiki. No local accounts, no shared logins, no "the ops password" in a vault that six people use.

- **One place to disable a person.** A leaver loses everything when the identity provider account is disabled. Each local account is a door left open for as long as it takes someone to remember it.
- **Phishing-resistant MFA, everywhere.** Passkeys and hardware security keys, not SMS or one-time codes. The US federal zero trust strategy requires agencies to stop supporting methods "that fail to resist phishing, including protocols that register phone numbers for SMS or voice calls, supply one-time codes, or receive push notifications" for staff access ([OMB M-22-09](https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-09.pdf)), and AWS recommends "phishing-resistant MFA such as passkeys and security keys wherever possible" ([AWS: IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)). Staff are the most valuable phishing targets you have; their second factor should be the strongest you can buy.
- **SSO tax is a security cost.** Many SaaS tools put SAML or OIDC behind an enterprise tier. Budget for it; a tool that holds production access and can't do SSO is a tool you can't offboard from reliably.
- **Groups, not people,** in every grant. Access is assigned to a group the identity provider manages (`eng-payments`, `oncall-primary`), and people join and leave groups. A grant to an individual is an exception with an expiry date.

## Zero Trust Instead of the VPN

The VPN model trusts the network: once you're on it, everything inside is reachable, and the security of the database rests on nobody hostile getting a connection. Google described the alternative in 2014: "We are removing the requirement for a privileged intranet and moving our corporate applications to the Internet" ([BeyondCorp: A New Approach to Enterprise Security](https://research.google/pubs/beyondcorp-a-new-approach-to-enterprise-security/)). NIST's zero trust architecture names the principle: "no implicit trust granted to assets or user accounts based solely on their physical or network location" ([NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final)).

In practice:

- **Every request is authenticated and authorized per resource.** SP 800-207's third tenet: access "is granted on a per-session basis," with least privilege, and "authentication and authorization to one resource will not automatically grant access to a different resource." Reaching the metrics dashboard says nothing about reaching the database.
- **Log into applications, not networks.** M-22-09 puts it plainly: "Users should log into applications, rather than networks," and "every application should be treated as internet-accessible from a security perspective."
- **An identity-aware proxy in front of internal web tools.** Google's Identity-Aware Proxy, Cloudflare Access, Tailscale, Pomerium and similar tools put SSO and policy in front of an app "without requiring a VPN" ([Google Cloud: IAP overview](https://docs.cloud.google.com/iap/docs/concepts-overview)). The internal tool itself still checks authorization; the proxy is a second gate, not the only one.

My default is no VPN for staff access at all. Private networks still matter for workloads (a database with no public address, services talking inside a VPC); they stop being the thing that decides whether a *person* gets in. Where a network path is unavoidable (a legacy system, a vendor's appliance), an identity-aware tunnel that authenticates per connection beats a flat VPN.

## The Device Is Part of the Identity

A valid password and MFA from an infected laptop is still an attacker. SP 800-207's fifth tenet: "The enterprise monitors and measures the integrity and security posture of all owned and associated assets," and "no asset is inherently trusted"; an asset with known vulnerabilities or outside management "may be treated differently (including denial of all connections to enterprise resources)."

- **Production access from managed devices only.** The device is enrolled in device management, its disk is encrypted, its OS is within a version or two of current, its screen locks, and endpoint detection runs on it. The identity provider checks these signals at sign-in and on each access request, not once at enrollment.
- **Personal devices get the low-risk tier:** email and chat, perhaps, but not the cloud console, not production, not customer data.
- **Shorter sessions for higher risk.** A stolen session cookie is only as good as its lifetime. Production-grade sessions last hours, not weeks, and step up (re-authenticate with a security key) for sensitive actions. After its incident, CircleCI's own list included "reducing session trust, adding authentication factors, and performing more regular access rotations."

## Cloud IAM: Roles, Not Users

In the cloud, humans never get long-lived credentials of their own. AWS's first two best practices say it: "Require human users to use federation with an identity provider to access AWS using temporary credentials" and "Require workloads to use temporary credentials with IAM roles to access AWS" ([AWS: IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)). Google and Azure say the same in their own terms.

- **SSO into roles.** People sign in through the identity provider and assume a role for a session. On AWS that's IAM Identity Center with permission sets, whose session duration defaults to 1 hour and can be set up to 12, with AWS's advice not to set it "longer than is needed to perform the role" ([AWS: Set session duration](https://docs.aws.amazon.com/singlesignon/latest/userguide/howtosessionduration.html)). The CLI gets the same short-lived credentials through `aws configure sso`; nobody runs `aws configure` with an access key.
- **Roles by job, not by person.** `read-only`, `developer`, `deployer`, `admin`, per environment, assigned to groups. Production gets a read-only role by default; anything that writes goes through the pipeline or a just-in-time grant.
- **Least privilege, measured.** Start from managed policies if you must, then narrow them from what's actually used: AWS's IAM Access Analyzer generates policies from CloudTrail activity, and its last-accessed data shows permissions nobody has touched. A role that hasn't used a permission in 90 days doesn't need it.
- **Separate accounts or projects per environment,** with organization-level guardrails (AWS service control policies, Google organization policies, Azure Policy) that no one inside the account can override: no disabling the audit log, no leaving the allowed regions, no public storage buckets.
- **The root account is sealed.** Hardware MFA, no access keys, credentials split and stored offline, an alert on every sign-in.

## No Long-Lived Keys, Anywhere

A static access key is a credential that works from anywhere, for anyone, until someone remembers to revoke it. Keys leak through commits, laptops, CI logs, screenshots and departing employees. Replace each kind:

- **CI federates with OIDC.** The pipeline gets a token from its platform for each job and exchanges it for cloud credentials that expire with the job. GitHub lists the benefits as no cloud secrets stored as "long-lived GitHub secrets," "more granular control," and "a short-lived access token that is only valid for a single job" ([GitHub: OpenID Connect](https://docs.github.com/en/actions/concepts/security/openid-connect)). The trust is scoped by the token's claims, so only one repository's production environment can assume the deploy role.
- **Workloads use attached roles** (instance profiles, task roles, workload identity on Kubernetes), never keys in environment variables.
- **Turn key creation off.** Google recommends applying the "Disable service account key creation" and "Disable service account key upload" constraints at the organization root "to establish a default where service account keys are disallowed," with exceptions per project ([Google Cloud: Managing service account keys](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)). On AWS, an organization guardrail that denies creating IAM user access keys does the same.
- **The remaining exceptions are inventoried.** A vendor that only accepts a static key gets a dedicated identity with the narrowest policy, a recorded owner, rotation on a schedule, and an alert when it's used from somewhere new.

A deploy role that only one repository's `prod` environment can assume, as an AWS trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:example-org/payments-api:environment:prod"
        }
      }
    }
  ]
}
```

The workflow job asks for `permissions: id-token: write`, and the `prod` environment carries the protection rules (required reviewers, the `main` branch only), so the condition on `sub` inherits them. A wildcard in `sub` (`repo:example-org/*`) hands production to every repository and every branch in the organization; it's the most common mistake in this setup.

## Just-in-Time Access and Break-Glass

Standing access to production is access an attacker inherits along with the laptop. The alternative is eligibility: people are *allowed* to request a role, and they hold it only for the task.

- **Eligible, not active.** Microsoft's Privileged Identity Management names the distinction: an eligible assignment "requires a user to perform one or more actions to use the role," such as MFA, a justification or an approval, and activation lasts "a preconfigured period of time" ([Microsoft Entra: What is Privileged Identity Management?](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure)). Google Cloud's Privileged Access Manager does the same with entitlements that set who can request, whether a justification and approval are required, and "the maximum duration a grant can last," after which the roles are revoked ([Google Cloud: Privileged Access Manager](https://docs.cloud.google.com/iam/docs/pam-overview)). On AWS, the same pattern is built from Identity Center permission sets and an access-request tool.
- **A reason, a scope and a clock.** Every request names a ticket or incident, the account or cluster, and a duration. I default to the length of the task with a cap of a few hours; extending is a new request.
- **Approval scaled to risk.** Read-only production access for the on-call engineer can be self-approved and logged. Write access to production data stores, IAM changes and anything touching keys need a second person, and nobody approves their own request.
- **On-call gets the fast path,** pre-approved for the rotation's duration and scoped to what incident response needs, so just-in-time access never delays a fix.

**Break-glass** is for when the normal path is down: the identity provider is having an outage, SSO is misconfigured, the access tool is broken. Keep one or two emergency accounts per cloud, outside SSO, with hardware MFA, credentials sealed and split, and an alert to the security channel the moment one is used. Every use is reviewed afterwards, and the credentials are rotated after each use. Test the procedure once a quarter: break-glass that nobody has tried is a locked glass case.

## Hosts, Clusters and Databases

**No SSH keys on servers, no bastion hosts.** Two better options:

- **A session manager.** AWS Systems Manager Session Manager provides shell access "without the need to open inbound ports, maintain bastion hosts, or manage SSH keys," controlled by IAM and logged ([AWS: Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)). Google's IAP TCP forwarding and Azure Bastion fill the same role. Note the caveat in AWS's documentation: session logging "isn't available for Session Manager sessions that connect through port forwarding or SSH," so interactive shells give you a transcript and tunnels don't.
- **SSH certificates.** Where SSH stays, servers trust a certificate authority instead of a list of keys, and users get a certificate signed after an SSO login, valid for hours. OpenSSH certificates carry principals (the accounts they're valid for), a validity interval, and options such as `force-command` or `no-port-forwarding`; a key revocation list handles the rest ([OpenSSH: ssh-keygen CERTIFICATES](https://man.openbsd.org/ssh-keygen#CERTIFICATES)). Signing usually happens in a service (Teleport, Smallstep, Vault, a cloud's own), but the mechanism is one command:

```bash
# sign alice's key for 8 hours, as the "deploy" principal only, no port forwarding
ssh-keygen -s ./user_ca -I alice@example.com -n deploy -V +8h -O no-port-forwarding id_ed25519.pub
```

Better than either is not needing a shell: if engineers routinely log into production hosts to fix things, that's a gap in [immutable deploys](/docs/delivery/containers) and [observability](/docs/observability/overview), and each login is a reason to close it.

**Kubernetes** follows the same model: `kubectl` authenticates through the cloud's IAM or the identity provider, humans get read-only roles by default, and writes go through GitOps ([Kubernetes Operations](/docs/operations/kubernetes#namespaces-and-rbac)).

**Databases** get personal, short-lived credentials too: IAM database authentication on the major clouds, or a secrets manager issuing a user per session that expires on its own. Shared database passwords on engineers' machines are the worst of every rule above.

## Production Data Is a Separate Grant

Access to the infrastructure and access to the data on it are different permissions, and they're granted separately. An engineer who can restart a service, read its logs and change its scaling doesn't need to read the `customers` table, and most days shouldn't be able to.

- **Infrastructure roles exclude data reads** where the cloud allows it: no `s3:GetObject` on customer buckets, no query permissions on production databases, no decrypt permission on the data keys.
- **Data access goes through tooling with a reason,** the same model as [Support Access](/docs/security/support-access): a ticket, a scope, a time limit, masked by default, every read logged.
- **Ad hoc queries against production** go through an audited query tool or a read replica with column masking, never a superuser connection from a laptop. [Sensitive Data](/docs/security/sensitive-data#access) sets the just-in-time rule for it.
- **No production copies outside production.** Not in staging, not on a laptop, not in a spreadsheet export. Tests use synthetic data ([Test Data](/docs/quality/test-data)).

## Secrets Never on Laptops

Production secrets live in a secrets manager and are injected at runtime ([Environments & Configuration](/docs/operations/environments#secrets)). The corollary for people: no production credential is ever copied to a laptop. No `.env.production`, no database password in a shell history, no service account key in `~/Downloads`. When an engineer needs to act as a service, they use their own short-lived role with the permissions to do the task, so the action is attributed to them. Development credentials for local work are scoped to development resources and can't reach production even if they leak.

Back it with scanning: secret scanning with push protection on every repository, and endpoint checks for credential files where your device management can run them.

## Joiners, Movers and Leavers

Access is a lifecycle, and most of the risk is at the transitions.

- **Joiners** get access from their role, through groups, on day one, provisioned from the HR system into the identity provider and from there into every app by SCIM ([Provisioning and Deprovisioning](/docs/security/sso-and-federation#provisioning-and-deprovisioning)). Nobody files tickets for twenty tools.
- **Movers** lose their old access when they gain the new. The engineer who moved from payments to growth doesn't keep payments production access "in case"; accumulated access from past roles is how long-tenured accounts end up with everything.
- **Leavers** are disabled in the identity provider the day they leave, before the last meeting ends for involuntary departures, which cuts every SSO app at once. Then the follow-through: revoke active sessions and device certificates, rotate any shared secret they could have seen, transfer ownership of their resources, and check the exception list for keys or local accounts in their name.
- **Access reviews** quarterly: each group's owner confirms its members, and each privileged role's grants are reviewed against use. AWS's own advice is to "regularly review and remove unused users, roles, permissions, policies, and credentials." Record the review; it's the evidence an auditor asks for under logical access ([SOC 2](/docs/compliance/soc-2#engineering-is-the-evidence)).

## Audit Everything

Every grant, session and privileged action is recorded where the people being recorded can't edit it: cloud audit logs (CloudTrail, Cloud Audit Logs, Azure Activity Log) shipped to a separate account, session transcripts, access-request history, identity provider sign-ins. [Audit Trails](/docs/building-blocks/audit-trails#make-it-tamper-evident) covers making the store tamper-evident.

Then alert on what matters: root or break-glass sign-ins, access key creation, IAM policy changes, disabling of audit logging, sign-ins from unmanaged devices or new countries, a just-in-time grant used for something outside its stated scope. And sample: each month, read a handful of production sessions against their tickets. Logs nobody reads deter nobody.

## Checklist

- **One identity provider** for every internal tool, groups not people, no local or shared accounts.
- **Phishing-resistant MFA** for all staff, and short sessions with step-up for production.
- **No VPN for people:** per-application access through SSO and an identity-aware proxy.
- **Managed devices only** for production, with posture checked at each access.
- **Roles, not users,** in every cloud: SSO sessions of hours, least privilege from actual use, guardrails per environment, root sealed.
- **No long-lived keys:** OIDC for CI, attached roles for workloads, key creation disabled, exceptions inventoried.
- **Just-in-time production access** with a reason, a scope, a time limit and approval for writes; break-glass sealed, alerted and tested.
- **Session managers or SSH certificates,** never shared keys or bastions; Kubernetes and databases on the same identity.
- **Data access granted separately** from infrastructure access, through audited tooling.
- **No production secrets on laptops.**
- **Joiner, mover and leaver** automated through SCIM, with same-day deprovisioning and quarterly reviews on record.
- **Every grant and session audited,** alerted on and sampled.

## References

**Specifications**

- [NIST SP 800-207: Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final), no implicit trust by network location, per-session access, device posture as a tenet
- [OMB M-22-09: Moving the U.S. Government Toward Zero Trust Cybersecurity Principles](https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-09.pdf), phishing-resistant MFA for staff and logging into applications rather than networks

**Reference**

- [AWS: IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html), federation with temporary credentials, roles for workloads, phishing-resistant MFA, least privilege and removing unused access
- [AWS: Set session duration for AWS accounts](https://docs.aws.amazon.com/singlesignon/latest/userguide/howtosessionduration.html), IAM Identity Center sessions of 1 to 12 hours
- [AWS: Update the maximum session duration for a role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_update-role-settings.html), role sessions from 1 to 12 hours, 1 hour by default
- [AWS: Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html), shell access without inbound ports, bastions or SSH keys, and its logging limits
- [GitHub: OpenID Connect](https://docs.github.com/en/actions/concepts/security/openid-connect), short-lived, per-job cloud credentials scoped by token claims
- [GitHub: Configuring OpenID Connect in AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws), the trust policy conditions on `aud` and `sub`
- [Google Cloud: Best practices for managing service account keys](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys), avoiding keys and disabling key creation by organization policy
- [Google Cloud: Privileged Access Manager overview](https://docs.cloud.google.com/iam/docs/pam-overview), just-in-time grants with justification, approval and a maximum duration
- [Google Cloud: Identity-Aware Proxy overview](https://docs.cloud.google.com/iap/docs/concepts-overview), application-level access control without a VPN
- [Microsoft Entra: What is Privileged Identity Management?](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure), eligible versus active roles, activation, approval and access reviews
- [OpenSSH: ssh-keygen CERTIFICATES](https://man.openbsd.org/ssh-keygen#CERTIFICATES), user and host certificates, principals, validity intervals and revocation lists

**In practice**

- [BeyondCorp: A New Approach to Enterprise Security](https://research.google/pubs/beyondcorp-a-new-approach-to-enterprise-security/), removing the privileged intranet, 2014
- [CircleCI: January 4, 2023 incident report](https://circleci.com/blog/jan-4-2023-incident-report/), a stolen SSO session from an engineer's laptop and the controls added afterwards
