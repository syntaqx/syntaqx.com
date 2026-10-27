+++
title = "Running a Card Vault"
nav_title = "Card Vault"
description = "Building the one service that holds card numbers: token design, envelope encryption, who may detokenize, capture iframes, BIN data and the CDE around it."
category = "Payments Industry"
order = 1424
part = "Running a Provider"
tags = ["payments", "pci", "tokenization", "security", "cryptography", "vault"]
+++

[Sensitive Data](/docs/payments/sensitive-data) makes the case for keeping card numbers out of your systems, and [Processor Routing](/books/payments/processor-routing) makes the case for holding them anyway: cards stored as one processor's tokens belong to that processor. Once you decide to own the credential layer, one service holds every card number you have ever seen, and PCI SSC's own tokenization guidance calls that vault the "most attractive target" in the system. This chapter is about building and operating it: what a token is, how the number is stored, who can get it back, how it gets in, and the [cardholder data environment](/docs/compliance/pci-dss) around it.

## The Shape of a Vault

A vault is a handful of components behind one boundary, and nothing outside the boundary ever handles a card number:

![The cardholder data environment as one boundary: the customer's browser posts the card into a capture iframe served by the vault; the tokenizer stores the encrypted number and returns a token to the platform; the platform asks the forwarder to charge the token; the forwarder swaps in the card number and sends it only to allowlisted processors. A key service wraps the data keys, and a reveal console lets a few people see a number, with every view logged.](/diagrams/card-vault.svg "Everything that touches a card number sits inside one boundary. The platform holds tokens, sends tokens and gets tokens back; the card number only ever leaves toward a processor.")

- **Capture:** hosted fields or an SDK that send the card from the customer's device straight to the vault.
- **Tokenizer and store:** issues tokens and keeps the encrypted numbers.
- **Key service:** a KMS or HSM that holds the keys protecting the store.
- **Forwarder:** the only path a number takes out, toward processors.
- **Reveal:** the rare, audited way a person sees a number.

Each is in [PCI scope](/docs/compliance/pci-dss), whoever runs it. On a platform the vault holds cards for other businesses' customers, which makes you a service provider to them, so this chapter includes the requirements PCI DSS adds for service providers; a merchant vaulting only its own customers' cards is assessed as a merchant and can drop those. The rest of the platform stays out of scope only if it holds no credentials that can authenticate to any of these components, which is the line the guidance draws.

## Getting the Card In

**Hosted fields** are the main door: an iframe served from the vault's origin, so the card is typed into your page, not the merchant's. The iframe's security is now the merchant's compliance too. Since SAQ A's revision (published January 2025, effective March 31, 2025), a merchant validating with it must confirm its site isn't susceptible to script attacks, and PCI SSC's FAQ 1588 lets an embedding merchant meet that by relying on the provider's confirmation that its iframe protects against them when implemented as instructed. If you ship the iframe, you're making that promise:

- **`postMessage` with an exact target origin,** never `*`, and check `event.origin` on everything received. MDN is blunt that not checking enables cross-site scripting.
- **`frame-ancestors`** in the iframe's Content Security Policy lists the origins allowed to embed it, set as a header (it's ignored in a `<meta>` tag). See [Security Headers](/docs/security/security-headers).
- **A strict CSP inside the iframe,** nonce-based, and no third-party scripts at all. Where your own payment pages must load one, pin it with Subresource Integrity, keep the inventory and justification requirement 6.4.3 asks for, and run the change and tamper detection on scripts and headers that 11.6.1 requires.
- **Protect the tokenize endpoint from card testing:** a short-lived, origin-bound session token from the page, rate limits per merchant and per IP, and the signals in [Fraud & Risk](/books/payments/fraud-and-risk). An open tokenizer is a free card-checking service.
- **Validate on both sides.** Luhn and brand checks in the field for fast feedback, again on the server as the authority, and a check that the brand matches what the merchant accepts.

**Other doors** each need the same care: a server-to-server API for partners that are themselves PCI compliant; file imports when a merchant migrates its cards in from another provider, encrypted to your key and deleted after loading; [phone payments](/books/payments/phone-payments), which have their own capture problem; and [card-present](/books/payments/card-present#p2pe-encrypt-at-the-glass) data encrypted at the terminal and decrypted in your environment under DUKPT keys (a fresh key per transaction, derived from one root) ([HSMs & Key Management](/books/payments/key-management#dukpt-and-pin-blocks)), where track data is deleted the moment the authorization returns.

**Keep the number out of logs.** The classic leak isn't the vault's database; it's a debug log of a raw processor request, so the forwarder never logs bodies and the security code field is redacted everywhere it can appear. The general rules, allowlist serializers and a card-number scanner, are in [Sensitive Data](/docs/payments/sensitive-data#logging-and-errors). Then assume something will slip and write the procedure for finding a number where it shouldn't be: retrieve or delete it, check whether a security code is with it, find the source and close it (12.10.7).

## Designing the Token

A token is what the rest of your system stores, logs and passes around, so its design decides how much damage everything outside the vault can do.

- **Random, never derived or sequential.** PCI SSC's guidelines allow tokens from an index, a sequence or a random number "not mathematically derived from the PAN", but a sequence number is a guessable one: anyone holding token 1041 can try 1042. Use enough randomness that guessing is hopeless; the 2015 product guidelines set the bar at less than one in a million chance of guessing the card number from a token. A database row ID is not a token.
- **Distinguishable from a card number.** The guidelines require that tokens be distinguishable from real numbers. A prefix (`tok_`) and a length no card has make that intrinsic. If a legacy schema forces a 16-digit token, make it fail the Luhn check; that's common practice, not a PCI rule, but it keeps tokens out of anyone's card-number detection and the reverse.
- **Two kinds of token.** The browser gets a short-lived, single-use **capture token**, good for minutes. The platform exchanges it, server to server, for the long-lived **stored token** it saves against the customer. A capture token caught in a log or replayed from a page can't be charged a second time, and the stored token never reaches a browser.
- **Scoped to the tenant that created it.** Every use checks that the caller owns the token. On a [multi-tenant](/docs/architecture/multi-tenancy) platform, a token that works for any merchant is a card number with extra steps.
- **Tokens that can pay are still valuable.** The 2011 guidance warns that tokens usable to initiate payments "may therefore have the same value to an attacker" and may be in scope even though they can't reveal the number. Anything that charges a stored token needs the same authentication and authorization as a payment API, because that's what it is.

**Format-preserving encryption** is the tempting alternative: encrypt the card number into another 16-digit number, with no vault lookup at all. It's stateless and drops into old schemas, but the token is an encrypted card number, every token ever issued falls to one key, and equal cards produce equal tokens. The algorithm choice has also narrowed: NIST declared FF3 unsuitable in 2017, and the second draft of SP 800-38G Revision 1 (February 2025) drops FF3-1 as well, leaving FF1. I use random tokens with a lookup, and FPE only where a legacy system leaves no choice.

**Replacing a card makes a new token.** When a customer re-enters a card, issue a new token and mark the old one replaced, rather than rewriting the number behind an existing token. Old payments, refunds and disputes keep pointing at the card they actually used. To spot the same card behind different tokens (duplicate customers, card testing, one card on many accounts), store a **fingerprint**: a keyed hash of the full number, under a key managed like any other (requirement 3.5.1.1). An unkeyed hash of a 16-digit number with a known BIN and Luhn digit is a short brute-force away from the number itself.

## Storing the Number

**Envelope encryption.** Each record, or each batch, is encrypted under its own data key with an authenticated cipher such as AES-256-GCM. The data key is stored beside the ciphertext, wrapped by a key-encrypting key that lives in a KMS or HSM and never leaves it. PCI DSS accepts exactly this, with the key-encrypting key at least as strong as the data key and stored separately (3.6.1, 3.6.1.2); it accepts keys inside a KMS built on secure cryptographic devices, and it doesn't accept a key "simply split into two parts" and kept in two files. The key-encrypting key never sits in the database it protects, in a config file, or in source. [HSMs & Key Management](/books/payments/key-management) covers the hierarchy above it.

**Every ciphertext names its key version,** as [HSMs & Key Management](/books/payments/key-management#cryptoperiods-and-rotation) requires of every key, so old and new keys can coexist. That matters because rotation in a KMS doesn't do what it sounds like. AWS states it plainly: rotating a KMS key "has no effect on the data that the KMS key protects. It does not rotate the data keys... or re-encrypt any data." Google and Azure say the same in their own words. So a vault runs two jobs:

- **Re-wrap** data keys under the new key-encrypting key after it rotates. Cheap: the data keys are small and the card numbers are untouched.
- **Re-encrypt** card numbers when a data key reaches the end of its cryptoperiod or is suspected compromised (3.7.4, 3.7.5). This one touches every affected record, so build it as a resumable job: work in batches, checkpoint progress, decrypt the new ciphertext and compare before committing each batch, and keep the retired key able to decrypt but never to encrypt until the job reports zero records left. NIST SP 800-57 suggests a data-encryption key be used to encrypt for up to two years, less for large volumes.

**What sits next to the ciphertext.** The token, the tenant, the BIN, the last four, brand, expiry, the fingerprint, the [network transaction ID](/books/payments/stored-credentials) from the first payment, a network token reference if you have one, and when the card was created and last used. That's everything support, routing, receipts and recurring billing need, and none of it is the number.

**Never the security code.** PCI DSS forbids storing the card verification code after authorization, even encrypted (3.3.1.2). It passes through memory into the one authorization that needs it and is gone; charges against a stored credential don't use it. Make sure the "passes through memory" part is true, which means checking what your HTTP client and logger do with request bodies.

**Retention is a decision with a job behind it.** Requirement 3.2.1 asks for a retention period with a business reason, and a check at least every three months that anything past it has been deleted. A reasonable rule: purge the number when the customer or merchant deletes the card, when the merchant leaves the platform, and when a card hasn't been used for a period just longer than your longest billing cycle (13 months covers annual renewals). Keep the token record and its BIN and last four so history still reads; delete the ciphertext, or with a data key per record, destroy the key. "Unused for seven years" is not a retention policy, it's an inventory.

**Bank accounts belong in the vault too.** An ACH platform stores account and routing numbers for every payer and payee, and they're as useful to a thief as a card number. Nacha requires large originators and third parties to render stored account numbers unreadable ([ACH & Bank Transfers](/books/payments/ach#the-rules-you-inherit)), and the same tokens, encryption, forwarder and reveal controls apply: the bank file builder is the forwarder for ACH, the one place an account number is decrypted on its way out. Providers do the same, and open-banking aggregators hand out processor tokens for bank accounts so the account number never reaches the platform at all.

## Who Gets the Number Back

Detokenization is the whole risk of a vault, so it gets the narrowest interface you can build.

**Systems get it only on the way to a processor.** The vault never returns a card number in an API response to the platform. Instead the platform sends its processor request through the **forwarder** with a placeholder where the card goes; the forwarder authenticates the caller, checks the token belongs to that tenant, substitutes the number and sends the request to the processor, and passes the response back. This is the pattern every vault provider sells: VGS calls them outbound routes on an HTTPS forward proxy, Basis Theory replaces `{{token}}` expressions in a proxied request, Evervault's Relay decrypts fields on the way out, and Skyflow requires processor URLs to be approved before production. Build your own the same way:

- **Callers authenticate as services** (mutual TLS or signed workload identity), and each is authorized per operation and per tenant. Network rules are a second layer, not the authentication. A detokenizing endpoint that trusts anything able to reach it is one misrouted security group from an open card-number API.
- **Destinations are an allowlist** of processor hostnames, enforced on egress, so the forwarder can't be pointed anywhere else (requirement 1.3.2 restricts outbound CDE traffic to what's necessary).
- **Unusual volume is an alert and a throttle.** The guidelines suggest systems "throttle or reject abnormal requests". A service that normally detokenizes a few thousand cards an hour and suddenly asks for a million is either a bug or a breach, and either way the vault should stop first.
- **Every detokenization is logged** with the caller, tenant, token, destination and purpose.

**People get it almost never.** Support rarely needs more than the BIN, last four, brand and expiry, and PCI DSS caps what a screen may show at the BIN and last four for anyone without a documented need (3.4.1). For the few who need more, typically fraud investigators and the team that handles card brand inquiries:

- **A named role,** not "anyone who can log in", granted by approval and reviewed every six months (7.2.4).
- **A reason and a ticket on every reveal,** MFA at the moment of the reveal, and a per-person daily cap that alerts when hit.
- **No copying out.** Over remote access, controls must stop a number being copied or moved without explicit authorization (3.4.2); a reveal shows the number, it doesn't export it.
- **Two people for anything in bulk,** like an export to another processor when a merchant leaves. [Processor Routing](/books/payments/processor-routing) describes those migrations, encrypted to the recipient's published key.

**No back doors.** No magic token that returns a test card in production, no unauthenticated maintenance or deploy endpoint, no shared admin login. Each is convenient once and in scope forever.

## BIN Data

The BIN table is how a vault answers "what kind of card is this?" without the card. It feeds [routing](/books/payments/processor-routing) (debit cards go to debit networks), [surcharging](/books/payments/surcharging-and-fees) (debit and prepaid can't be surcharged), [interchange](/books/payments/interchange-and-pricing) estimates and [fraud](/books/payments/fraud-and-risk) signals.

- **The data comes from your processor or the networks,** as files on a schedule. Visa's published attributes include funding source (credit, debit, prepaid, charge), consumer or commercial platform, country and currency, and a regulated indicator for Durbin-covered debit; PINless debit eligibility comes from the debit networks' own tables.
- **Load it atomically.** Build the new table beside the old one and swap; a delete-then-insert load leaves a window where every lookup misses.
- **Match on eight digits.** Visa has assigned only 8-digit BINs since April 2022, so match the longest prefix the data gives you. Store the BIN on the token record at tokenization, so later lookups don't need the number, and record which version of the table answered each decision it fed ([How Card Payments Work](/books/payments/card-payments#bins)).
- **Masking follows the BIN.** With an 8-digit BIN, showing the first eight and last four is allowed (FAQ 1492); truncation for storage has its own maximum formats (FAQ 1091), and different truncations of the same card must never be stored where they can be combined.

## Running the Environment

The vault's code is a small part of its security. Most of what PCI DSS checks is the environment, and most of it is ordinary good platform engineering written down.

- **Segmentation as code.** The CDE gets its own account or network, defined in [infrastructure as code](/docs/delivery/infrastructure-as-code). Inbound traffic only from the load balancer and named callers (1.3.1); outbound denied by default, with processor and KMS endpoints allowlisted through an egress proxy (1.3.2); data stores unreachable from anything untrusted (1.4.4). A rule allowing all outbound traffic to anywhere is the finding that undoes the rest. As a service provider, the segmentation is penetration-tested every six months (11.4.6).
- **Images built, never hand-tuned.** Hardened to a recognized standard such as the CIS Benchmarks (2.2.1), built by a pipeline, and replaced rather than patched in place. Turning off a host's automatic updates is fine only if rebuilds are frequent enough to install critical patches within a month of release (6.3.3). File integrity monitoring watches critical files and compares them at least weekly (11.5.2); each system either runs anti-malware or has a documented, periodically re-evaluated reason it doesn't need it (5.2.3).
- **No standing access.** MFA for every non-console access into the CDE (8.4.2), on top of the MFA for reaching the network remotely. Shell access through a session broker that records the session, not through SSH keys handed out to people. A **break-glass** role with hardware MFA, an alert on every use, and a test on a schedule, because an emergency path nobody has tried is a second outage. Passwords for any local accounts use a modern password hash ([Authentication & Sessions](/docs/security/authentication)), and nothing hard-codes a credential in a script, config file or source (8.6.2): processor keys and database passwords live in a secret manager.
- **Logs that someone reads.** Every access to card data, every admin action, every reveal and detokenization, shipped to storage the CDE can't modify (10.2, 10.3), reviewed by automation rather than a person skimming email (10.4.1.1), and kept 12 months with three immediately available (10.5.1).
- **Change goes through one door.** A reviewed pull request by someone other than the author, a [CI pipeline](/docs/delivery/ci-pipelines) whose tests actually run, and a deploy from the pipeline only. No `git pull` on a production host, no deploy triggered by an unauthenticated request, and infrastructure changes planned in review and applied with approval, not auto-applied on merge. Pre-production uses test cards, never live ones (6.5.5), and never production keys (3.6.1.1).
- **A defense in front of every public endpoint.** Since March 31, 2025, public-facing web applications in scope need an automated technical solution that detects and prevents web attacks, a web application firewall or equivalent, running continuously (6.4.2). The capture iframe and tokenize endpoint are exactly those applications.
- **TLS everywhere, verified everywhere.** Card data crosses networks only over strong cryptography with trusted, valid certificates (4.2.1), and nothing turns certificate verification off, not a staging flag, not a test client pointed at production. A disabled check that ships is a man-in-the-middle waiting for a route.
- **The cloud's own audit log.** Changes to the CDE's accounts, networks, keys and roles are recorded by the cloud provider's control-plane log, sent to the same protected store as everything else. Most cloud breaches are a configuration change nobody saw.
- **Scanned and tested on a schedule.** Internal vulnerability scans and external scans by an approved scanning vendor every three months (11.3.1, 11.3.2), internal and external penetration tests at least once a year and after significant change (11.4), and dependency and infrastructure-as-code scanning in CI; [Vulnerability Management](/docs/security/vulnerability-management) has the program around it.
- **Accounts that lock.** The reveal console and every admin login lock after no more than ten failed attempts, for at least 30 minutes or until an administrator unlocks them (8.3.4).
- **Scope reviewed every six months** as a service provider (12.5.2.1): where card data flows, where it's stored, including backups, and what can reach it.

## What This Means for the System You Build

- **Random, prefixed, tenant-scoped tokens,** short-lived at capture and long-lived only server-side, with a keyed fingerprint for matching cards.
- **Envelope encryption under a KMS or HSM key,** a key version on every ciphertext, and both a re-wrap job and a resumable, verified re-encryption job.
- **A retention rule and the purge job behind it,** run and verified quarterly.
- **Detokenization only through a forwarder to allowlisted processors,** with service authentication, tenant checks, throttles and a log line every time.
- **Reveals by role, reason and MFA, capped per person.**
- **An iframe you'd stake a merchant's SAQ on,** and logs that can't hold a card number or security code even when someone tries.
- **A CDE defined in code, built from images, entered with MFA, changed only through the pipeline.**

## References

**Specifications**

- [PCI SSC: PCI DSS v4.0.1](https://www.pcisecuritystandards.org/document_library/), requirements 1.3, 2.2, 3.2 to 3.7, 5.2.3, 6.3.3, 6.4.3, 6.5.5, 7.2, 8.4.2, 8.6, 10.2 to 10.5, 11.4.6, 11.5.2, 11.6.1, 12.5.2.1 and 12.10.7
- [PCI SSC: Tokenization Guidelines (2011)](https://listings.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf), token generation, the vault as the most attractive target, detokenization controls, out-of-scope criteria and high-value tokens
- [PCI SSC: Tokenization Product Security Guidelines (2015)](https://listings.pcisecuritystandards.org/documents/Tokenization_Product_Security_Guidelines.pdf), reversible and irreversible tokens, distinguishability, and the one-in-a-million guessing bar
- [PCI SSC: Guidance for PCI DSS Scoping and Network Segmentation](https://listings.pcisecuritystandards.org/documents/Guidance-PCI-DSS-Scoping-and-Segmentation_v1_1.pdf), CDE, connected-to and out-of-scope systems
- [NIST SP 800-38G Rev. 1, second public draft](https://csrc.nist.gov/pubs/sp/800/38/g/r1/2pd), format-preserving encryption with FF3 and FF3-1 removed, leaving FF1
- [NIST SP 800-57 Part 1 Rev. 5](https://doi.org/10.6028/NIST.SP.800-57pt1r5), cryptoperiods for data-encryption and key-wrapping keys

**Reference**

- [PCI SSC: FAQ 1588](https://pcisecuritystandards.org/faqs/1588), meeting the SAQ A script-attack criterion with the provider's confirmation
- [PCI SSC: Important updates for merchants validating to SAQ A](https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a), 6.4.3 and 11.6.1 removed from SAQ A and the new eligibility criterion, January 2025
- [PCI SSC: Payment Page Security and Preventing E-Skimming](https://blog.pcisecuritystandards.org/new-information-supplement-payment-page-security-and-preventing-e-skimming), guidance for requirements 6.4.3 and 11.6.1
- [PCI SSC: FAQ 1492](https://www.pcisecuritystandards.org/faqs/1492/), keyed hashes, and displaying an 8-digit BIN with the last four
- [PCI SSC: FAQ 1091](https://www.pcisecuritystandards.org/faqs/1091), maximum truncation formats with 6- and 8-digit BINs
- [Visa: Simplified requirements for eight-digit issuing BIN adoption](https://usa.visa.com/content/dam/VCOM/global/support-legal/documents/numerics-initiative-simplified-requirements-for-eight-digit-issuing-bin-adoption.pdf), 8-digit BINs from April 2022
- [Visa: BIN Attribute Sharing Service](https://developer.visa.com/docs/visa-bin-attribute-sharing-service/docs-request-response-codes), funding source, platform, country and regulated indicators
- [AWS KMS: Rotate keys](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html), rotation periods and why rotation doesn't re-encrypt data
- [Google Cloud KMS: Envelope encryption](https://docs.cloud.google.com/kms/docs/envelope-encryption), wrapped data keys stored with the data
- [MDN: Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), exact target origins and checking the sender
- [MDN: CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors), which pages may embed yours
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity), pinning a third-party script to its hash

**In practice**

- [VGS: HTTP proxy](https://docs.verygoodsecurity.com/vault/http-proxy), inbound reverse-proxy and outbound forward-proxy routes
- [Basis Theory: Proxies](https://developers.basistheory.com/docs/concepts/proxies/), replacing token expressions in an outbound request
- [Evervault: Relay](https://docs.evervault.com/primitives/relay), decrypting fields on the way to a processor
- [AWS Well-Architected: Implement break-glass procedures](https://docs.aws.amazon.com/wellarchitected/latest/devops-guidance/ag.sad.5-implement-break-glass-procedures.html), hardware MFA and alerts on emergency access
- [AWS Systems Manager: Session Manager logging](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-logging.html), recording administrative sessions
- [Plaid: Auth](https://plaid.com/docs/auth/), tokenized account numbers and processor tokens for bank accounts
