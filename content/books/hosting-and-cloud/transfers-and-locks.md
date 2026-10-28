+++
title = "Transfers, Locks & Registrar Security"
nav_title = "Transfers & Locks"
description = "Inter-registrar transfers, auth codes and the TAC, 60-day locks, the Transfer Policy Review, registrar and registry lock, and registrar account security."
category = "Hosting & Cloud Industry"
order = 2164
part = "Domains and DNS"
tags = ["domains", "transfers", "epp", "registry-lock", "account-security", "icann"]
+++

A domain name is the one thing a registrar holds that the customer can take to a competitor in about five days without the registrar's cooperation, and the one thing an attacker can take the same way. ICANN's Transfer Policy exists to make the first easy: the registrar of record must hand over an authorization code on request, can't refuse it over a billing dispute, and loses the name by default if it says nothing. Everything else in this chapter exists to make the second hard: the 60-day restrictions, the locks a registrar or a registry can put on a name, and the account security that decides whether the person asking for the code is the registrant at all.

The two goals pull against each other. Every protection that slows a hijacker slows a legitimate customer leaving, and registrars have commercial reasons to prefer slow. ICANN's rules mark the line: a registrar may protect a name, but the protection can't be harder to remove than changing the name's contacts, and a lock the registrant can't reasonably remove isn't a reason to deny a transfer. This chapter covers how the transfer works today and how the Transfer Policy Review will change it, the change-of-registrant process, registrar and registry lock, and account security after the 2024 Squarespace hijacks. The objects and statuses come from [The Domain Data Model & EPP](/books/hosting-and-cloud/epp-and-domain-data#statuses); disputes over a transfer belong to [Domain Disputes](/books/hosting-and-cloud/domain-disputes#transfer-disputes).

## How the Providers Do It

Every registrar implements the same policy, and the differences are in defaults, in what an auth code request has to pass through, and in what it sells to high-value customers. As of October 2026, from each provider's own pages:

| Provider | Default lock | Getting the auth code | Speeding up or stopping the transfer | Change of registrant | High-value protection |
| --- | --- | --- | --- | --- | --- |
| **Cloudflare Registrar** | Domains "stay locked" until the customer unlocks them | Shown in the dashboard after unlocking; can be regenerated | The customer can approve an outbound transfer immediately or reject it, which reapplies the lock; otherwise it auto-approves on the fifth day | Name, organization and email changes need approval from the old address (and the new one if the email changes), expire after seven days, and start a 60-day lock unless the current registrant ticks the opt-out | Registry lock for Enterprise customers; Custom Domain Protection with out-of-band, multi-person verification and manual changes |
| **GoDaddy** | Unlock is a separate step | Shown in the portal after identity verification and emailed to the registrant | Approving speeds it up; transfers "typically take 5-7 days" | A 60-day restriction applies only if the registrant applied it when approving the change | Domain Protection: high-impact actions (transfers, DNS edits, privacy changes) need a one-time password or a 2-step code; it must be downgraded to none before a transfer |
| **Namecheap** | Registrar Lock, disabled per domain | Sent to the registrant email, which may differ from the account email; the customer gives a reason | Namecheap has "5 days to release" the domain | Not covered on the transfer page | Registry Lock through Domain Vault for 26 listed TLDs, with extra authentication among user, registrar and registry; TOTP or U2F/WebAuthn two-factor, one method at a time |
| **Porkbun** | A lock toggle per domain | Shown in the dashboard ("Get Authorization Code") | "Approve Transfer Out" completes it early; about 5 days otherwise | 60 days at one registrar before a transfer, both ways | WebAuthn security keys, mandatory on every login once paired |
| **Squarespace** | Domain Lock toggle | Requested after reauthenticating with password or 2FA, then emailed to the registrant contact | Up to 15 days; a 5-day window to review or cancel from the transfer email (Squarespace Domains LLC and II LLC), a cancel link for Tucows-registered names | 60-day lock after a registrant contact update, a purchase or a transfer in | Reauthentication on the auth code request |
| **IONOS** | gTLDs "locked against transfer by default" | "Show Authorization Code", fetched from the registry, which can take minutes | Not stated | 60 days under the customer's name for listed gTLDs | Not stated on the transfer page |
| **Network Solutions** | Not stated on the FAQ | Emailed to the registrant "within 24 hours of your request" | The losing registrar's FOA goes to the registrant, who must respond to stop an unwanted transfer | 60-day lock, which the provider may waive on request | Not stated on the FAQ |
| **Verisign** (registry for .com, .net, .cc, .name) | Not applicable | Not applicable | Not applicable | Not applicable | Registry Lock: server statuses on the domain and its hosts; unlocking needs a request from an authorized registrar person, a phone call-back and a security phrase |

Three things stand out:

- **The auth code goes to the registrant's email, not the account's.** GoDaddy, Namecheap, Squarespace and Network Solutions all send it to the registrant contact on the domain, which may be a different address from the login. That is the policy's identity check in practice: the code proves control of the registrant email, so the registrant email is the asset an attacker wants.
- **Early approval is now the norm.** Cloudflare, GoDaddy and Porkbun let the customer approve an outbound transfer instead of waiting out the five days, which turns the losing registrar's notice into a one-click accept. The Transfer Policy Review moves the other way on that notice: its replacement may not contain an approve button.
- **Registry lock is sold to a minority.** Cloudflare offers it on Enterprise, Namecheap on a list of TLDs, and Verisign through participating registrars. Everyone else relies on the registrar's own lock, which the account holder can remove from the dashboard, which is what an attacker with the account can do too.

## How We Got Here

**2004: portability by default.** ICANN's Inter-Registrar Transfer Policy took effect on 12 November 2004, to give registrants "enhanced domain name portability" and the choice of registrar, price and service that comes with it. The design choice that defines it is the default: the registry completes a requested transfer unless the losing registrar sends a denial within five days, so a registrar that stalls loses. ICANN approved two independent providers for the companion Transfer Dispute Resolution Policy in November 2004. What it cost: a name now moved on the gaining registrar's word that the registrant had authorized it, and the authorization codes that proved it were often long-lived, reused or stored in plain text.

**2005 to 2009: hijacking becomes a registrar problem.** ICANN's Security and Stability Advisory Committee published its Domain Name Hijacking Report (SAC007) on 12 July 2005, and on 19 August 2009 SAC040, "Measures to Protect Domain Registration Services Against Exploitation or Misuse", after a run of high-profile account takeovers at registrars. SAC040 recommended multi-factor authentication on registrar accounts, change notifications and multi-party confirmations, and asked registrars to offer "stronger levels of protection" to customers who want them as optional services. It also noted Verisign's proposal for registry-registrar two-factor authentication through the registry services process. Those optional services are where registry lock and the high-value tiers in the table come from.

**2016: the Change of Registrant lock.** The Transfer Policy that took effect on 1 December 2016 replaced the 2015 version and added Part II, Change of Registrant: a material change to the registrant's name, organization or email needs confirmation from both the prior and new registrant, and triggers a 60-day inter-registrar transfer lock unless the prior registrant opted out. It answered a hijacking pattern (take the account, change the registrant, transfer away before the owner notices) and cost every legitimate sale, rebrand and contact correction a confirmation round-trip and a two-month freeze.

**2018: GDPR breaks the gaining side.** The Temporary Specification that redacted public registration data from 25 May 2018 meant a gaining registrar could no longer look up the registrant's email to send its Form of Authorization. ICANN's Board resolved on 26 January 2020 to defer enforcement of the gaining registrar's FOA requirement until the GNSO's Transfer Policy review settled it, and the transfer process has run on the auth code and the losing registrar's notice alone since. The Registration Data & RDAP chapter's [How We Got Here](/books/hosting-and-cloud/registration-data-and-rdap#how-we-got-here) has the data side.

**2021: secure authorization information.** RFC 9154 (December 2021, Standards Track, by Verisign's James Gould and Richard Wilhelm) defined how auth codes should work: generated from a secure random value with at least 128 bits of entropy, set only while a transfer is in progress, stored by the registry only as a salted one-way hash, never stored by the losing registrar, and unset by the registry when the transfer succeeds. It is a practice built from existing EPP features, signaled by a namespace in the EPP greeting, so a registry can adopt it without a new protocol.

**2024 and 2025: the registrant is the only transfer contact.** ICANN updated the Transfer Policy on 21 February 2024 to fit the Registration Data Policy, which no longer requires registrars to collect an administrative contact. Under the updated text, "The Registered Name Holder is the only party that has the authority to approve or deny a transfer request", and the Change of Registrant definition drops the administrative contact. Contracted parties could implement it from 21 August 2024 and had to by 21 August 2025. Registrars moved their own systems on their own dates: Realtime Register announced on 2 July 2026 that it would switch transfer authorization and WDRP notices from the Admin Contact to the registrant on 4 August 2026, its own implementation date for the updated policy.

**2026: the Transfer Policy Review.** The GNSO Council started a two-phase review on 18 February 2021; the working group reached full consensus on 47 recommendations on 31 January 2025; the Council approved them and sent its report to the Board on 10 April 2025; and the Board adopted them on 7 June 2026, directing implementation "subject to prioritization", with no timeline. [The Transfer Policy Review](#the-transfer-policy-review) below has what changes.

## The Transfer Flow

An inter-registrar transfer under the policy in force as of October 2026 has five steps, and each one is an EPP command or a policy deadline.

**1. The registrant gets the auth code.** The registrar of record must give the registrant the unique AuthInfo code and remove `clientTransferProhibited` within five calendar days of the registrant's first request, unless it offers self-service for both (section I.A.5.2). The method can't be "more restrictive" than the one for changing contacts or nameservers (I.A.5.3), and the registrar may not refuse the code or the unlock "solely" because of a payment dispute (I.A.5.4). Codes must be unique per domain (I.A.5.5). Under RFC 9154 the code is set at the registry only now, with an EPP `<update>` that carries the new `<domain:authInfo>`, and the registry stores a hash of it.

**2. The gaining registrar requests the transfer.** It sends `<transfer op="request">` for the domain with the code. The registry checks the code (RFC 9154 returns 2202 on a mismatch), puts the domain in `pendingTransfer`, and queues a poll message to the losing registrar. The transfer data carries the requesting registrar (`reID`), the request date, the registrar that must act (`acID`) and `acDate`, the deadline for that action (RFC 5731). The gaining registrar's own Form of Authorization (I.A.2) is still in the text and still unenforced.

**3. The losing registrar notifies and decides.** It must send its FOA to the registrant "not later than twenty-four (24) hours" after the registry's notice (I.A.3.4). It may then approve (`op="approve"`), deny with one of the permitted reasons (`op="reject"`), or do nothing. The permitted denials (I.A.3.7) are evidence of fraud, a reasonable dispute over the registrant's identity, non-payment for a past or current period with the name on registrar hold, the registrant's express, informed objection, a request within 60 days of the creation date, and a request within 60 days of a prior transfer. The required denials (I.A.3.8) are a pending UDRP or URS proceeding the registrar has been told about, a court order, a pending TDRP dispute, and the 60-day Change of Registrant lock. It may not deny for non-payment of a future period, for the registrant's silence, or because of a lock the registrant couldn't reasonably remove (I.A.3.9).

**4. Silence approves.** If the losing registrar doesn't respond within five calendar days, the transfer is approved by default (I.A.3.5), and the registry completes it unless it receives a denial in that time (I.A.6.2). The registry sets `acDate` accordingly, and its auto-approval is a server action the losing registrar sees as a poll message.

**5. Completion.** Sponsorship moves, the registry unsets the code (RFC 9154 section 5.4), a year is added to the registration with the unexpired term capped at ten years (I.A.15), and the domain shows `transferPeriod`, ICANN's informative status for the grace period after a successful transfer. The 60-day post-transfer restriction starts.

Two escape hatches exist. The Transfer Emergency Action Contact (TEAC) is a registrar-to-registrar channel for urgent problems such as a hijack; a registrar must respond to a TEAC message within four hours (I.A.4.6.3). And a registry must undo a transfer within five calendar days of a qualifying notice, or 14 days after a dispute decision unless a court action is filed (I.A.6.4). Beyond those, a wrongful transfer goes to the TDRP or a court, covered in [Transfer Disputes](/books/hosting-and-cloud/domain-disputes#transfer-disputes).

The registrar's side of this is a pair of state machines it doesn't fully control. As the losing registrar it must notice the poll message, send the FOA within 24 hours, decide within five days, and record why; as the gaining registrar it must submit, wait, and reconcile when the registry's poll says the transfer completed or was rejected. Every transition is an `epp_transactions` row from [Commands and Responses](/books/hosting-and-cloud/epp-and-domain-data#commands-and-responses), and the domain's `pendingTransfer` is a `domain_statuses` row the registry set.

## Change of Registrant

Part II of the Transfer Policy treats a change of registrant as its own transaction, separate from moving registrars. As written in October 2026:

- **What counts.** A Change of Registrant is a Material Change (anything "not a typographical correction") to the prior registrant's name, organization or email (II.A.1.1, II.A.1.3). Registrars may treat any name or organization change as material. A phone or address change isn't one, which is why Cloudflare applies those immediately and gates only name, organization and email.
- **Two confirmations.** The new registrant and the prior registrant (or a Designated Agent either has authorized) each confirm through a secure mechanism, within a deadline the registrar sets but no longer than 60 days (II.C.1.2, II.C.1.4). The policy's notes give examples: an email with an affirmative response, or a code sent by SMS, call, web, email or post. The registrar processes the change within one day of both confirmations and notifies both parties (II.C.1.5, II.C.1.6).
- **The lock.** The registrar must then impose a 60-day inter-registrar transfer lock, unless the registrant opted out before the request (II.C.2), and must tell the prior registrant to transfer first if it wants to avoid it (II.C.1.3). The policy doesn't require a specific EPP status for it; if the registrar uses `clientTransferProhibited`, the registrant must not be able to remove it.

Registrars differ in where they put the opt-out. Cloudflare offers a "Do not apply 60 day transfer lock" checkbox to the current registrant only; GoDaddy applies the restriction only if the registrant chose it when approving; Network Solutions accepts requests to waive it, which ICANN permits but doesn't require. A registrar that defaults the opt-out on has removed the protection; one that hides it has turned every contact fix into a two-month hold. The lock was always a blunt instrument, and the Transfer Policy Review removes it.

## The Transfer Policy Review

The Board adopted all 47 recommendations on 7 June 2026 "subject to prioritization", with implementation to follow through an Implementation Review Team and no effective date as of October 2026. Until the revised policy is published with a date, the flow above is the law; the changes below are what to design for:

| Topic | Today | After the recommendations | Recommendation |
| --- | --- | --- | --- |
| The code | "AuthInfo Code" | "Transfer Authorization Code" (TAC), "a token created by the Registrar of Record and provided upon request" | 4, 5 |
| Issuing it | Within five calendar days | Within 120 hours, stated as a maximum, not a standard | 6 |
| Its strength | Unique per domain | RFC 9154's composition as a MUST, including 128 bits of entropy; the registry verifies the syntax | 7, 8 |
| Its life | Unbounded in policy | Valid for 336 hours (14 days) from when it's set at the registry, enforced by the registry; may be reset to null early by agreement or for the registrant's protection, with a rationale on request | 9 |
| Generation and storage | A code can exist and sit stored for long periods, the working group's stated risk | Generated only on the registrant's request; the registry stores it securely to RFC 9154's standard | 10 |
| Notice | None required at issue | A "Notification of TAC Issuance" to the registrant within 10 minutes, in English and the agreement's language, ideally by a different channel from the code | 11 |
| Reuse | Not addressed | One-time use; the registry resets it to null when it accepts it; read-only `<info>` checks don't count | 13 |
| Records | Not specified | The registrar retains when, how and to whom every TAC and notice was sent, under the Data Retention Specification | 14 |
| Gaining FOA | In the text, unenforced since 2020 | Eliminated | 15 |
| Losing FOA | "Standardized Form of Authorization" | Renamed "Transfer Confirmation", carrying the gaining registrar's IANA ID, and it "MUST NOT include a mechanism for immediately approving" the transfer | 17 |
| Auto-approval | Five calendar days | 120 hours | 17.4 |
| Post-creation restriction | Registrar may deny within 60 days; some registry agreements say 60 days | Registrar must restrict for 720 hours (30 days) from creation, uniformly | 3 |
| Post-transfer restriction | Registrar may deny within 60 days of a transfer | Must restrict for 720 hours from completion, removable early only on a documented, specific request with a listed reason | 18 |
| Completion notice | None required | A "Notification of Transfer Completion" from the losing registrar within 24 hours | 19 |
| Change of Registrant | Part II, two confirmations, 60-day lock | A standalone "Change of Registrant Data" policy: no Designated Agent, no dual confirmation, no 60-day lock; a notification to the registrant within 24 hours instead, on by default with an opt-out | 25 to 28 |
| TEAC | Four-hour response | 24-hour response, started by an email, within 720 hours of the alleged loss | 29 to 32 |
| Disputes | Registrars only can file a TDRP | A request to the GNSO to study registrant access to the TDRP or a new mechanism for stolen names | 33 |

The direction is clear: fewer locks and confirmations that registrants experience as friction, and more security in the code itself (random, short-lived, hashed, single-use, announced on issue). Two consequences matter for the system. The registrar can't pre-generate codes or show a stored code in the dashboard; it issues one on request, at the registry, and announces it. And the 60-day freeze after a contact change goes away, which removes the step that made a hijack via a registrant change slow, so the TAC notice and account security carry more of the load. The working group's own reasoning concedes the gap that remains: a bad actor who takes over a registrant's account, changes the contact details and retrieves the TAC can make a transfer that "may technically comply with the Transfer Policy" (Recommendation 33).

## Registrar Lock and Registry Lock

A lock is a set of EPP statuses that make the registry reject a command. Who can set and clear them is the whole difference:

| | Registrar lock | Registry lock |
| --- | --- | --- |
| **Statuses** | `clientTransferProhibited`, often with `clientUpdateProhibited` and `clientDeleteProhibited` | `serverTransferProhibited`, `serverUpdateProhibited`, `serverDeleteProhibited` (Verisign requires all three for a name to count as registry-locked) |
| **Set by** | The registrar, at registration (with the registrant's consent in the agreement) or on request (I.A.5.1) | The registry, on a request from "an authorized representative from the sponsoring Registrar" (ICANN's standard registry lock amendment language) |
| **Removed by** | The registrar, on the account holder's click; must be possible within five days or by self-service | The registry, after an out-of-band check: Verisign calls the authorized registrar person back and requires an individual security phrase |
| **Protects against** | Accidental transfers and unauthorized transfers by someone without account access | A compromised registrar account, a compromised registrar, and automation errors |
| **Doesn't protect against** | Anyone who can log into the account | A registrant's own out-of-band contacts being compromised; content or DNS hosted elsewhere |
| **Covers** | The domain object | The domain and, at Verisign, its host objects, locked separately (example.com with two in-zone nameservers is three locks), unavailable for hosts in non-Verisign TLDs |
| **Cost and reach** | Free and usually on by default | Sold as a premium service; offered by a subset of registries (ICANN's EPP status page: "some Registry Operators offer a Registry Lock Service") |

Registry lock exists because the registrar's lock is only as strong as the registrar's login. The out-of-band call is the point: an attacker who has the customer's password, session and email still has to pass a phone verification with a named person at the registrar, who in turn has to pass one with the registry. The cost is speed. A nameserver change on a registry-locked name is a ticket, a call-back and an unlock window, and ICANN's status page warns that lifting a registry lock "can take longer". That is why it suits names whose DNS changes a few times a year and whose loss would be a headline: banks, exchanges, large brands.

A registry lock is a registry service, so a registry that offers it adds it to its registry agreement through ICANN's Registry Services Evaluation Policy, using standard language that limits it to those three statuses; the registrar is the only party the registry talks to. Namecheap's description of what it blocks is a useful precision: nameserver changes, deletion and transfers are blocked; contact and host record updates are not. The registrar's own systems also have to respect it: a registry-locked name with a pending renewal, an abuse hold or a UDRP lock still has to work, and the registrar's tooling must not attempt updates it knows the registry will reject.

Locks also serve other chapters. A UDRP proceeding requires a lock within two business days ([What the Registrar Must Do](/books/hosting-and-cloud/domain-disputes#what-the-registrar-must-do)); an abuse case may add a transfer lock to stop a malicious name moving away ([DNS Abuse Duties](/books/user-generated-platforms/abuse-desks#dns-abuse-duties)); a court order freezes the name; the registry sets `serverTransferProhibited` during redemption ([Redemption and Pending Delete](/books/hosting-and-cloud/domain-lifecycle#redemption-and-pending-delete)). Each has its own reason, its own owner and its own release condition, and only some of them can be removed by the registrant. A design with one `locked` boolean can't tell the registrant why the unlock button is gray, and can't let the abuse desk lift its lock without lifting the UDRP's.

## Account Security

The registrar account, not the registry, is where names are lost. The researchers who analyzed the July 2024 Squarespace hijacks described a migration failure rather than an exploit. After Squarespace bought Google Domains' assets (announced 15 June 2023, closed 7 September 2023 for $180.7 million in total consideration), migrated customers' domains sat in Squarespace accounts that hadn't been claimed yet. Between 9 and 12 July 2024, attackers took at least a dozen domains, mostly cryptocurrency businesses such as Celer Network, Compound Finance, Pendle Finance and Unstoppable Domains, and pointed some at phishing sites. Researchers at MetaMask and Paradigm said Squarespace assumed migrating users would sign in with social login, so an attacker could create an account with a migrated domain's email address before the owner did; that password accounts didn't require email verification; and that multi-factor authentication was disabled during the migration. Squarespace's post-mortem attributed it to "a weakness related to OAuth logins" fixed within hours and disputed the researchers' account. Either way, the failure was account-level, and no transfer policy would have stopped a hijacker who owned the account.

What the public practices and that incident add up to:

- **Make strong second factors the default for anyone holding names.** Porkbun, Namecheap and Cloudflare support security keys or WebAuthn; GoDaddy gates high-impact actions behind a one-time password or a 2-step code; Squarespace requires reauthentication with the password or 2FA before releasing a transfer code. Phishing-resistant factors (passkeys, security keys) are the playbook's [Passkeys First](/docs/security/authentication#passkeys-first) default; SMS codes, used for step-up by several registrars, are the weakest of them. SAC040 recommended multi-factor authentication for registrar accounts in 2009.
- **Treat unlock, auth code, nameserver change, contact change and account email change as sensitive actions.** Each gets fresh authentication ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions)), a notification to the registrant contact and the account owner, and a short delay or a second approver for accounts that opt in, SAC040's multi-party confirmation.
- **Recovery is the real login.** An attacker who can reset the account email through support, or claim an unclaimed account by its email, never needs the password ([Recovery Is the Real Login](/docs/security/authentication#recovery-is-the-real-login)). Support agents who can change an account's email, disable MFA or push a domain to another account are a privileged path and need the controls in [Support & Admin Access](/docs/security/support-access).
- **Migrations are the dangerous moment.** A bulk move of names into new accounts (an acquisition, a platform consolidation, a reseller exit) creates accounts nobody has claimed and security settings that didn't carry over. The safe sequence keeps names registrar-locked through the move, requires email verification before any claimed account can act, carries MFA enrollment over or forces it at first login, and holds outbound transfers and nameserver changes for newly claimed accounts for a period. Migrations, Shutdowns & End of Life covers the wider playbook.
- **Delegated access is account access.** Cloudflare warns that anyone with admin rights on a zone can unlock domains and get auth codes; Porkbun and GoDaddy let owners grant access to other users. Roles that can unlock or transfer should be separate from roles that edit DNS, per [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#identity-iam-and-api-keys).
- **The registrant email is the last factor.** Today's auth code, tomorrow's TAC notice and every change confirmation go there. A registrant email on the domain itself is circular (lose the domain, lose the mail that would warn you), which is what SAC040 observed in the hijacks it studied. Warn customers whose registrant email is on a domain they hold with you.

ICANN's RAA also makes a breach of the account system a reportable event: a registrar must notify ICANN within seven days of any unauthorized access to or disclosure of registrant account information or registration data (section 3.20).

## My Default

My default is to lock every name by default with `clientTransferProhibited`, release the auth code only after step-up authentication and only to the registrant contact, and build the code path to the Transfer Policy Review's rules now: generate the code on request with 128 bits of entropy, set it at the registry with a 14-day expiry I enforce myself until registries do, never store it after display, announce its issue to the registrant within minutes through a channel other than the one that carried it, and send a completion notice when it's used. That costs nothing a customer would notice and puts the system on the side of the policy that's coming. For the 60-day Change of Registrant lock, I'd apply it, offer the opt-out to the prior registrant only, and plan to remove it when the revised policy takes effect.

Above that baseline, I'd require phishing-resistant MFA for any account holding more than a handful of names or any name with a registry lock, and offer registry lock where the registry sells it, with my own out-of-band verification on top, for customers who change DNS rarely and can't afford to lose a name. The tradeoff that would change it is operational: registry lock turns every nameserver change into a scheduled call, so for a customer that moves DNS often (a CDN migration, a hosting provider that manages records), I'd keep the registrar lock, multi-person approval and alerts instead of the registry lock.

## How to Build It

The chapter adds two tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model): `domain_transfers`, one row per change of sponsoring registrar, registrant or account, and `domain_locks`, one row per reason a name is locked. The registry's view of a lock is a `domain_statuses` row from [The Domain Data Model & EPP](/books/hosting-and-cloud/epp-and-domain-data#how-to-build-it); the commands are `epp_transactions` rows.

```sql
CREATE TABLE domain_transfers (          -- a change of registrar, registrant or account
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  domain_id             UUID NOT NULL REFERENCES domains (resource_id),
  kind                  TEXT NOT NULL CHECK (kind IN ('inter_registrar_in',
                          'inter_registrar_out', 'inter_registrant', 'inter_account')),
  account_id            UUID NOT NULL REFERENCES accounts (id),  -- the customer here: gaining
                                         -- or losing side, or the account giving up the name
  to_account_id         UUID REFERENCES accounts (id),  -- inter_account: the receiving account
  counterparty_iana_id  INT,             -- the other registrar, for inter-registrar kinds
  state                 TEXT NOT NULL CHECK (state IN ('requested', 'code_issued',
                          'submitted', 'pending', 'confirmations_pending', 'approved',
                          'rejected', 'cancelled', 'completed', 'failed', 'reversed')),
  -- the authorization code: never stored, only its life
  code_issued_at        TIMESTAMPTZ,     -- set at the registry
  code_expires_at       TIMESTAMPTZ,     -- 336 hours under TPR Rec 9; the registrar's cap until then
  code_issue_notice_at  TIMESTAMPTZ,     -- Notification of TAC Issuance, within 10 minutes
  code_channel          TEXT CHECK (code_channel IN ('dashboard', 'registrant_email',
                          'api')),
  -- the registry's clock
  request_txn_id        UUID REFERENCES epp_transactions (id),  -- <transfer op="request">
  registry_requested_at TIMESTAMPTZ,     -- reDate
  action_due_at         TIMESTAMPTZ,     -- acDate: silence approves at this instant
  confirmation_sent_at  TIMESTAMPTZ,     -- losing FOA, later "Transfer Confirmation": 24 h
  -- the decision
  decision              TEXT CHECK (decision IN ('approved_by_registrant',
                          'approved_by_registrar', 'auto_approved', 'rejected', 'cancelled')),
  denial_reason         TEXT CHECK (denial_reason IN ('fraud', 'identity_dispute',
                          'non_payment', 'registrant_objection', 'within_60_days_of_create',
                          'within_60_days_of_transfer', 'udrp', 'urs', 'court_order', 'tdrp',
                          'change_of_registrant_lock')),  -- I.A.3.7 and I.A.3.8, as data
  decided_by            TEXT,            -- typed actor: 'registrant', 'staff:...', 'registry'
  decision_txn_id       UUID REFERENCES epp_transactions (id),  -- approve or reject
  decided_at            TIMESTAMPTZ,
  -- inter_registrant: today's Part II confirmations, later a notice only
  prior_registrant_data_id UUID REFERENCES registrant_data (id),
  new_registrant_data_id   UUID REFERENCES registrant_data (id),
  prior_confirmed_at    TIMESTAMPTZ,
  new_confirmed_at      TIMESTAMPTZ,
  lock_opted_out        BOOLEAN,         -- the prior registrant's 60-day opt-out, before the request
  -- completion
  completed_at          TIMESTAMPTZ,
  completion_notice_at  TIMESTAMPTZ,     -- Notification of Transfer Completion, 24 h
  years_added           SMALLINT,        -- one, within the ten-year cap
  reversed_by_dispute_id UUID,           -- a TDRP or court outcome; FK added in Domain Disputes
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((decision = 'rejected') = (denial_reason IS NOT NULL)),
  CHECK (kind <> 'inter_registrant' OR new_registrant_data_id IS NOT NULL),
  CHECK (kind <> 'inter_account' OR to_account_id IS NOT NULL),
  CHECK (kind NOT LIKE 'inter_registrar%' OR counterparty_iana_id IS NOT NULL)
);

CREATE UNIQUE INDEX domain_transfers_one_open
  ON domain_transfers (domain_id)
  WHERE state NOT IN ('rejected', 'cancelled', 'completed', 'failed', 'reversed');

CREATE TABLE domain_locks (              -- one reason a name is locked, and how it ends
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  domain_id             UUID NOT NULL REFERENCES domains (resource_id),
  kind                  TEXT NOT NULL CHECK (kind IN ('registrar_lock', 'registry_lock',
                          'post_create', 'post_transfer', 'change_of_registrant',
                          'udrp', 'urs', 'court_order', 'tdrp', 'abuse', 'non_payment')),
  statuses              TEXT[] NOT NULL, -- EPP statuses it requires: {'clientTransferProhibited'};
                                         -- empty for a restriction enforced by the registrar's logic
  blocks                TEXT[] NOT NULL CHECK (blocks <@ ARRAY['transfer', 'update',
                          'delete', 'registrant_change', 'nameserver_change']),
  registrant_removable  BOOLEAN NOT NULL,  -- can the customer clear it from the dashboard
  reason_ref            TEXT,            -- the case, invoice, order or proceeding number
  transfer_id           UUID REFERENCES domain_transfers (id),  -- the event that started it
  abuse_mitigation_id   UUID REFERENCES abuse_mitigations (id),
  requested_by          TEXT NOT NULL,   -- typed actor
  valid_during          TSTZRANGE NOT NULL,  -- upper bound set for timed restrictions
  -- release: a registry lock needs an out-of-band check before the registry acts
  release_requested_at  TIMESTAMPTZ,
  release_requested_by  TEXT,
  release_verified_via  TEXT CHECK (release_verified_via IN ('step_up', 'callback',
                          'multi_party', 'registry_callback', 'proceeding_closed',
                          'court_order', 'expired')),
  release_verified_by   TEXT,            -- the named person who took the call
  released_at           TIMESTAMPTZ,
  CHECK (cardinality(blocks) > 0),
  CHECK ((released_at IS NULL) OR (release_verified_via IS NOT NULL)),
  CHECK (kind <> 'registry_lock' OR statuses @> ARRAY['serverTransferProhibited',
         'serverUpdateProhibited', 'serverDeleteProhibited']),
  CHECK (kind NOT IN ('udrp', 'urs', 'court_order', 'tdrp') OR NOT registrant_removable)
);

CREATE INDEX domain_locks_in_force ON domain_locks (domain_id) WHERE released_at IS NULL;
```

Notes on the sketch:

- **The code is a lifetime, not a column.** RFC 9154 says the losing registrar must not store the authorization information and the registry keeps only a salted hash, so `domain_transfers` records when a code was issued, how, when it expires and when the notice went out, and never the code. A support agent who wants to read a customer the code generates a new one, which is an issue event with a notice.
- **Four kinds in one table.** An inter-registrar transfer in, one out, a change of registrant and a push between accounts at the same registrar share the questions an auditor or a dispute asks (who asked, who confirmed, when, and was it allowed), so they share a table with kind-specific checks. A change of registrant also closes a `domain_contacts` range and opens one for the new `registrant_data` row ([Registration Data & RDAP](/books/hosting-and-cloud/registration-data-and-rdap#how-to-build-it)).
- **Clocks are stored, not recomputed.** `action_due_at` is the registry's `acDate`, `code_expires_at` the TAC's life, and the FOA and notice timestamps are measured against the policy's 24-hour and 10-minute limits. When the revised policy takes effect the limits change; the computation lives in [rules as data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored) with an effective date, so rows created before it keep the old deadlines.
- **Denials are an enumerated policy.** `denial_reason` is the list in sections I.A.3.7 and I.A.3.8 and nothing else, because a NACK for any other reason is a compliance violation, and the losing registrar must be able to show ICANN which one applied.
- **Locks are rows, statuses are effects.** Each lock records why, who, what it blocks and how it ends; `domain_statuses` records what the registry shows. The registrar's job is to keep the two consistent: the union of statuses required by locks in force is what should be set, and a reconciliation job flags a status with no lock behind it or a lock whose status the registry doesn't show. That is how the customer sees "locked by a UDRP proceeding, removable by no one" next to "registrar lock, removable by you".
- **Registry lock release is two-step.** `release_requested_*` and `release_verified_*` record the out-of-band call (who requested, who verified, by which channel), and the registry's own call-back to the registrar is a second check outside this table. A registry lock removed without a verification row is the incident.
- **Timed restrictions are locks with an end.** The post-create, post-transfer and change-of-registrant restrictions are `domain_locks` rows with an upper bound and no EPP status (or `clientTransferProhibited` that the registrant can't clear), so the 60-day, 720-hour or opted-out cases are one query.
- **Events:** `transfer.code_issued`, `transfer.requested`, `transfer.confirmation_sent`, `transfer.approved`, `transfer.rejected`, `transfer.completed`, `transfer.reversed`, `registrant_change.confirmed`, `lock.applied`, `lock.release_requested` and `lock.released` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the EPP worker, notifications (registrant and account owner), the abuse desk and the security monitoring that watches for unlock, code and contact changes on the same account in a short window.

## Auditing

- **Every code issued.** When, to which channel and contact, after which authentication, its expiry, and whether it was used, which is the evidence the Transfer Policy Review's records recommendation asks registrars to retain and the first thing a hijack investigation needs.
- **Every outbound transfer's clock.** The registry's notice, the FOA sent within 24 hours, the decision, the denial reason if any, and the actor, so a complaint to ICANN Compliance about a denied or ignored transfer can be answered from rows.
- **Every change of registrant.** Both confirmations, the opt-out choice and when it was offered, the old and new registrant data rows, and the lock it produced.
- **Every lock and release.** Kind, statuses, who applied it, who requested and who verified the release, and through which channel, with registry lock releases reconciled against the registry's own records ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Account security events next to domain events.** Logins, MFA changes, email changes and support-assisted recoveries on the account, joined by time to unlocks and code issues on its names; the pattern that precedes a hijack is visible only when they're in one timeline.
- **Status drift.** Statuses at the registry that no lock explains, and locks whose status is missing, with how long each lasted.

## What This Means for the System You Build

- **Lock by default** and make the unlock a sensitive action with step-up authentication and a notice.
- **Issue codes on request,** strong, short-lived and announced, and never store one after it's shown.
- **Run the losing registrar's clock as a state machine** with the 24-hour notice, the five-day deadline and an enumerated denial reason.
- **Record changes of registrant as transfers** with both confirmations and the opt-out, and be ready to drop the lock when the revised policy lands.
- **Model locks as reasons with owners,** separate from the statuses they set, so each can be lifted by the right party.
- **Offer registry lock for names that can't be lost,** with your own out-of-band check in front of the registry's.
- **Harden the account, not just the name:** phishing-resistant MFA, recovery controls, guarded support powers, and a migration plan that never leaves names in unclaimed accounts.
- **Watch the registrant email,** because every code, notice and confirmation goes there.

## References

**Policies and contracts**

- [ICANN: Transfer Policy (2016 version)](https://www.icann.org/resources/pages/transfer-policy-2016-06-01-en), auth code and unlock within five days (I.A.5), losing FOA within 24 hours (I.A.3.4), default approval after five days (I.A.3.5, I.A.6.2), permitted and required denials (I.A.3.7 to I.A.3.9), TEAC four hours (I.A.4.6.3), undo (I.A.6.4), ten-year cap (I.A.15), Change of Registrant (Part II), 1 December 2016 compliance date
- [ICANN: Transfer Policy (updated 21 February 2024)](https://www.icann.org/resources/pages/transfer-policy-2024-02-21-en), the Registered Name Holder as the only transfer authority, the Change of Registrant definition without the administrative contact, implementation from 21 August 2024 and by 21 August 2025, the gaining FOA deferral
- [ICANN: Domain Name Transfers for registrars](https://www.icann.org/en/contracted-parties/accredited-registrars/resources/domain-name-transfers), policy versions and effective dates, the Board's 26 January 2020 deferral of gaining FOA enforcement
- [GNSO Council: Recommendations Report to the ICANN Board on the Transfer Policy Review (31 March 2025)](https://gnso.icann.org/sites/default/files/policy/2025/draft/gnso-council-recommendations-report-to-icann-board-tpr-wg-31mar25-en.pdf), the IRTP's 12 November 2004 start, the review's 18 February 2021 start, Recommendations 2 to 33 as summarized in the table
- [ICANN Board: Approved Resolutions, 7 June 2026](https://www.icann.org/en/board-activities-and-meetings/materials/approved-resolutions-regular-meeting-of-the-icann-board-07-06-2026-en), Resolution 2026.06.07.04 adopting the 47 recommendations "subject to prioritization", with Council approval on 12 March 2025 and transmission on 10 April 2025
- [ICANN: 2013 Registrar Accreditation Agreement](https://www.icann.org/resources/pages/approved-with-specs-2013-09-17-en), notice of unauthorized access to account or registration data within seven days (3.20)
- [ICANN: Standard Amendment Language, Registry Lock (June 2019)](https://itp.cdn.icann.org/en/files/consensus-policy/standard-amendment-language-registry-lock-14jun19-en.pdf), registry lock as a registry service requested by the sponsoring registrar's authorized representative, limited to the three server statuses
- [ICANN: EPP Status Codes](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en), client and server prohibited statuses, `pendingTransfer`, `transferPeriod`, registry lock and its slower removal
- [ICANN: Approved providers for the TDRP (2004 announcement)](https://www.icann.org/en/announcements/details/icann-approves-dispute-resolution-providers-for-transfer-dispute-resolution-policy-8-11-2004-en), ADNDRC and NAF approved in November 2004

**Specifications**

- [RFC 9154: EPP Secure Authorization Information for Transfer](https://www.rfc-editor.org/rfc/rfc9154.html), December 2021, Standards Track: 128 bits of entropy, short TTL, salted hash at the registry, no storage by the losing registrar, 2202 on mismatch, automatic unset after transfer, the secure-authinfo-transfer namespace
- [RFC 5731: EPP Domain Name Mapping](https://www.rfc-editor.org/rfc/rfc5731.html), transfer data elements `reID`, `reDate`, `acID`, `acDate`, `exDate`
- [RFC 5730: Extensible Provisioning Protocol](https://www.rfc-editor.org/rfc/rfc5730.html), the transfer `op` values request, cancel, approve and reject, and the poll queue

**Security advisories and incidents**

- [ICANN SSAC: SAC040, Measures to Protect Domain Registration Services Against Exploitation or Misuse (19 August 2009)](https://itp.cdn.icann.org/en/files/security-and-stability-advisory-committee-ssac-reports/sac-040-en.pdf), multi-factor authentication, change confirmations, optional stronger protections, Verisign's registry-registrar two-factor proposal, SAC007 (12 July 2005)
- [Krebs on Security: Researchers: Weak Security Defaults Enabled Squarespace Domains Hijacks (15 July 2024, updated 23 July)](https://krebsonsecurity.com/2024/07/researchers-weak-security-defaults-enabled-squarespace-domains-hijacks/), the 9 to 12 July 2024 hijacks, the affected companies, the researchers' findings on account creation, email verification and MFA, Squarespace's OAuth explanation
- [Squarespace: Alphabet selling Google Domains assets to Squarespace (15 June 2023)](https://www.squarespace.com/press-coverage/2023/6/15/alphabet-selling-google-domains-assets-to-squarespace), the announcement
- [Squarespace: Form 10-Q for the quarter ended 30 September 2023](https://www.sec.gov/Archives/edgar/data/1496963/000149696323000073/sqsp-20230930.htm), closing on 7 September 2023 and $180.7 million total consideration

**Providers**

- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/), locked by default, registry lock for Enterprise
- [Cloudflare: Transfer domain out from Cloudflare](https://developers.cloudflare.com/registrar/account-options/transfer-out-from-cloudflare/index.md), unlock, code regeneration, manual approval or rejection, fifth-day auto-approval, admin roles can unlock
- [Cloudflare: Registrant contact updates](https://developers.cloudflare.com/registrar/account-options/domain-contact-updates/index.md), fields that need approval, seven-day expiry, two-address approval, 60-day lock and opt-out
- [Cloudflare: Custom Domain Protection](https://www.cloudflare.com/products/registrar/custom-domain-protection/), out-of-band, multi-user verification and manual changes
- [GoDaddy: Transfer my domain away from GoDaddy](https://www.godaddy.com/help/transfer-my-domain-away-from-godaddy-3560), unlock, identity verification, code by email, 5-7 days, the conditional 60-day restriction
- [GoDaddy: What is Domain Protection?](https://www.godaddy.com/help/what-is-domain-protection-32311), tiers and one-time password or 2-step approval for high-impact actions
- [Namecheap: How to transfer a domain from Namecheap to another registrar](https://www.namecheap.com/support/knowledgebase/article.aspx/258/84/how-to-transfer-a-domain-from-namecheap-to-another-registrar/), Registrar Lock, code to the registrant email, five days to release
- [Namecheap: What is Registry Lock?](https://www.namecheap.com/support/knowledgebase/article.aspx/10536/2289/what-is-registry-lock/), Domain Vault, eligible TLDs, statuses, what it blocks and doesn't
- [Namecheap: How can I enable/disable Two-Factor Authentication?](https://www.namecheap.com/support/knowledgebase/article.aspx/9253/45/how-to-twofactor-authentication), U2F and TOTP, one method at a time
- [Porkbun: How to Transfer a Domain From Porkbun to Another Registrar](https://kb.porkbun.com/article/27-how-to-transfer-domain-from-porkbun-to-another-registrar), unlock, code, early approval, 60-day rule
- [Porkbun: How to secure your account with a physical security key using WebAuthn](https://kb.porkbun.com/article/119-how-to-secure-your-account-with-a-physical-security-key-using-webauthn), security keys required on every login once paired
- [Squarespace: Transferring a domain away from Squarespace](https://support.squarespace.com/hc/en-us/articles/205812338), reauthentication for the transfer code, registrant email, 60-day locks, up to 15 days, cancellation windows by registrar
- [IONOS: Transferring a domain from IONOS to another provider](https://www.ionos.ca/help/domains/transferring-your-domain-away-from-ionos-to-another-provider/transferring-a-domain-from-11-ionos-to-another-provider/), default lock on gTLDs, code from the registry, 60 days
- [Network Solutions: Domain transfer auth code FAQ](https://www.networksolutions.com/help/article/domain-transfer-auth-code-faq), code to the registrant within 24 hours, the FOA email, the waivable 60-day lock
- [Verisign: Registry Lock](https://www.verisign.com/resources/registrar-resources/registry-lock), TLDs, the three server statuses, host locks, call-back and security phrase
- [Realtime Register: ICANN updates gTLD Transfer Policy from 4 August 2026 (2 July 2026)](https://realtimeregister.com/blogs/icann-updates-gtld-transfer-policy-from-4-august-2026), a registrar's own implementation date for registrant-based transfer authorization and WDRP notices
