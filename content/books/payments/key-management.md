+++
title = "HSMs & Key Management"
description = "Payments cryptography as its own discipline: HSMs, key hierarchies, key blocks, DUKPT and PIN blocks, the move off TDES, key ceremonies and cryptoperiods."
category = "Payments Industry"
order = 1430
part = "Running a Provider"
tags = ["payments", "security", "cryptography", "hsm", "pci", "keys"]
+++

[Running a Card Vault](/books/payments/card-vault) treated its key service as a box: wrap this data key, unwrap that one. This chapter opens the box.

Most engineering teams meet cryptography as a library call: pick AES-GCM, get a key from a key management service, move on. Payments cryptography doesn't work like that. The keys that protect PINs and card data are governed by their own standards (PCI PIN, ANSI X9, ISO 9564), they live in certified hardware that does nothing else, they're exchanged between companies under procedures written for auditors, and the algorithms are decades old because every terminal and every bank on the other end of the wire has to agree on them. A provider that gets this wrong doesn't get a bug report. It fails a PCI PIN assessment, or it can't connect to a network at all.

This chapter is the working knowledge: what an HSM is for, how a key hierarchy is built, which formats the industry has settled on, and what a platform needs even if it never sees a PIN.

## Why an HSM

A **hardware security module** is a tamper-responsive computer whose job is to hold keys and use them without ever letting them out. Application code sends it a request ("translate this PIN block from the terminal's key to the network's key", "verify this card's cryptogram") and gets back a result. The clear key never exists in the application's memory, on its disk, or in a heap dump.

Two certifications matter:

- **FIPS 140-3**, the US standard for cryptographic modules, which defines four increasing levels of security. Payment HSMs are typically validated at Level 3, where the module has to detect and respond to physical tampering rather than just show evidence of it afterward.
- **PCI PTS HSM**, the card industry's own approval for HSMs used in payment functions. PCI publishes the approved devices and when each approval expires.

A **payment HSM** is not a general-purpose one with a different label. It implements payment-specific commands (PIN translation, PIN verification, card verification values, EMV cryptograms, DUKPT) and enforces payment-specific rules, like refusing to move a PIN block from one card number to another.

## The Key Hierarchy

Payment keys are arranged in layers, each protecting the one below. Only the top layer lives permanently inside the HSM; everything else is stored outside, encrypted under it, and loaded into the HSM when used.

![A payment key hierarchy: the master key never leaves the HSM; under it, a zone master key shared with a partner protects zone PIN keys, a terminal key-encrypting key loads terminals and their DUKPT keys, and a vault key-encrypting key wraps the data keys that encrypt card numbers.](/diagrams/key-hierarchy.svg "Every key is protected by the one above it. Only the master key stays inside the HSM; the rest are stored as key blocks, and the teal path is the one a PIN from a terminal takes.")

- **The master key** (Thales calls it the LMK, Atalla the MFK) never leaves the HSM. Every other key your HSM manages is stored encrypted under it.
- **Key-encrypting keys** protect keys in transit between parties. A **zone master key** (ZMK) is the one you share with a network or partner, exchanged once, in components, under the procedures in [Key Ceremonies](#key-ceremonies-split-knowledge-and-dual-control).
- **Working keys** do the actual work and change often. A **zone PIN key** (ZPK) encrypts PINs on one link between you and a network, and is itself sent to the other side encrypted under the ZMK. **Data keys** encrypt card numbers at rest. A **base derivation key** (BDK) is the root of a terminal estate's DUKPT keys.

The design rule underneath is separation: a key has one purpose, and the system enforces it. A PIN key that can also be used to decrypt data is a PIN key someone can use to decrypt PINs.

## Key Blocks: The Key Knows What It's For

For years, symmetric keys moved between systems as bare encrypted bytes. Nothing in the ciphertext said what the key was for, which made attacks possible that reorder or repurpose key material: take a PIN encryption key and convince an HSM it's a data key.

A **key block** fixes that by wrapping the key together with authenticated attributes: its purpose, its algorithm, which operations it permits, whether it can be exported. Change any of it and the block fails integrity checks. The format the industry uses was ANSI X9 TR-31, since standardized as **ANSI X9.143**, and most people still call it TR-31.

PCI PIN made key blocks mandatory (requirement 18-3, introduced in December 2014) in three phases, with the later two extended in 2020:

| Phase | Scope | Effective |
| ----- | ----- | --------- |
| 1 | Internal connections and key storage in service provider environments, including everything connected to HSMs | June 1, 2019 |
| 2 | External connections to networks and associations | January 1, 2023 |
| 3 | Merchant hosts, POS devices and ATMs | January 1, 2025 |

Every phase is now in effect. If you're building a provider today, key blocks aren't a migration; they're the only format you should accept.

## DUKPT and PIN Blocks

A terminal can't hold one key for its whole life: steal the device, extract the key, and every PIN it ever encrypted is exposed. **DUKPT** (Derived Unique Key Per Transaction) gives each terminal an initial key derived from the estate's BDK, and derives a fresh key for every transaction from that, so compromising one transaction's key reveals neither earlier nor later ones. The current specification, ANSI X9.24-3-2017, is AES-based; the older TDES variant survives in an annex for the estates still running it.

The PIN itself travels as a **PIN block**, defined by ISO 9564. **Format 0**, the long-standing default for TDES, combines the PIN with the card number into an 8-byte block. **Format 4**, added for 128-bit block ciphers in a 2015 amendment, is the one for AES. Whatever the format, the provider's servers only ever hold the encrypted block, and the only operation they perform on it is asking the HSM to translate it from the terminal's key to the network's key. AWS's documentation states the rule an HSM enforces: the card number on both sides of a translation must match, so a PIN can't be moved to a different card.

## Leaving TDES

Most of the installed base of payment cryptography still runs on Triple DES, and the rest of the world is leaving it. NIST's SP 800-131A Rev. 2 (2019) disallows two-key TDEA for encryption, and three-key TDEA has been disallowed for encryption since the end of 2023. The PCI Council stopped treating two-key TDEA as strong cryptography years ago and recommends AES.

Payments moves slower than that, because every terminal, HSM and network link has to change together, and a terminal estate can take years to replace. AWS's own example of PIN translation shows the in-between state: a terminal encrypts an AES Format 4 PIN block under DUKPT, and the HSM translates it to a TDES Format 0 block for a downstream link that doesn't support AES yet. The practical stance for a new provider: build on AES (AES DUKPT, Format 4 PIN blocks, AES key blocks) from the start, support TDES only at the edges where a partner still requires it, and track every TDES key as a dated liability with an owner.

## Key Ceremonies, Split Knowledge and Dual Control

Some keys have to be moved by people: the first ZMK with a network, the master key when an HSM is commissioned, a key recovered from backup. Those moments are where a single insider could take a key, so the standards remove the single insider.

- **Split knowledge:** the key is divided into components, and no one person ever holds enough to reconstruct it. Each component has its own **key custodian**.
- **Dual control:** no sensitive key operation can be performed by one person alone.
- **Ceremonies:** a scripted, witnessed, logged procedure in a controlled room, where custodians enter their components, every step is recorded, and the record is signed.
- **Key check values:** each component, and the assembled key, is verified by its check value, a short fingerprint made by encrypting a block of zeros with the key. Custodians compare check values to confirm they entered the right component and the parties built the same key, without anyone revealing the key itself. A component whose check value doesn't match is never used.

PCI DSS requires split knowledge and dual control for any manual cleartext key operation on keys that protect stored card data (requirement 3.7.6), and PCI PIN applies the same principles to every PIN key. The engineering goal is to need ceremonies as rarely as possible: remote key loading and electronic key exchange replace most of them, which is why they're worth the effort. In September 2026 the Council published **Key Management and Operations (KMO) v1.0**, a standard of its own for the lifecycle of keys protecting account data, starting with the key management behind PIN and P2PE; expect assessors to start asking against it.

### Loading Terminals

A terminal needs its initial keys before it can take a PIN. Traditionally that meant shipping devices to a **key injection facility**, a secure room where keys are loaded under dual control. **Remote key loading** with ANSI TR-34 instead uses asymmetric cryptography to deliver a symmetric key-encrypting key to a device that proves its identity with a certificate, so the device can be keyed in the field. For a platform shipping terminals to thousands of small merchants, remote key loading is what makes the fleet operable at all ([Card-Present Payments](/books/payments/card-present)).

## Cryptoperiods and Rotation

Every key has a **cryptoperiod**: how long it may be used, set by its strength, its exposure and what it protects. PCI DSS requires a defined cryptoperiod for each key type and a process for changing keys at the end of it (requirement 3.7.4), and service providers must document their whole cryptographic architecture, including each key's strength and expiry, and must not reuse production keys in test (3.6.1.1). NIST SP 800-57 is the reference for choosing the periods.

Rotation is easy to promise and hard to do, so design for it:

- **Every ciphertext records which key made it** (a key ID beside the data), so old and new keys can coexist during a rotation; [Running a Card Vault](/books/payments/card-vault#storing-the-number) shows the re-wrap and re-encrypt jobs that follow.
- **Rotation is a routine job,** run on a schedule and rehearsed, not a project that happens when someone remembers.
- **Revocation is a runbook.** If a key is suspected compromised, the steps to replace it with every partner should already be written down and tested, because that's the day nobody has time to work them out.

![An exploded view of the payment key hierarchy in four layers: the master key, clear only inside the HSM; the key-encrypting keys (zone master key, terminal KEK, vault KEK); the working keys (zone PIN key, base derivation key, data keys); and the protected data (PIN blocks, device keys, card numbers). A table gives NIST's suggested cryptoperiods: under 2 years for key-wrapping keys and for data keys' encrypting use, and decryption up to 3 years beyond that.](/diagrams/pm-keys-hierarchy-exploded.svg "Each layer is encrypted under the one above, so a rotation only reaches one layer down: a new KEK means re-wrapping data keys, and only a new data key means re-encrypting data.")

## Where the HSMs Run

Running payment HSMs used to mean racks in two data centers, smart cards in safes, and quarterly trips for key ceremonies. The cloud options now cover most of it, with different trade-offs:

| Option | What you get | What you still own |
| ------ | ------------ | ------------------ |
| **AWS Payment Cryptography** | A managed, elastic payment crypto API on PCI PTS HSM V3 and FIPS 140-2 Level 3 hardware, with TR-31 and TR-34 key exchange, DUKPT, PIN translation and EMV cryptogram validation | Key policy, key exchange with partners, and how your application uses it; no raw access to the hardware |
| **Azure Payment HSM** | Single-tenant Thales payShield 10K devices (FIPS 140-2 Level 3, PCI HSM v3) in your virtual network, under your sole administrative control | Everything a payShield owner does, including capacity, backup and key ceremonies, just without the data center |
| **AWS CloudHSM** | Single-tenant, general-purpose HSMs validated at FIPS 140-2 or 140-3 Level 3 | You build the payment functions; it's the right tool for vault and signing keys, not PIN processing |
| **Google Cloud HSM** | A managed cluster of FIPS 140-2 Level 3 HSMs behind Cloud KMS | General-purpose keys only; not a payment HSM |
| **On-premises payment HSMs** | Full control, any vendor feature | Hardware lifecycle, physical security, secure rooms and every procedure around them |

The FIPS levels above are what each service's documentation states. NIST moved every FIPS 140-2 certificate to its historical list in September 2026; modules on it can stay in existing systems, but new procurements, federal ones especially, should look for FIPS 140-3 validation.

My default for a new provider is a managed payment crypto service for PIN and EMV work and a general-purpose HSM-backed KMS for everything else. The question to ask any option is the one the assessor will ask: where does the clear key exist, and who can make it exist?

## What a Platform That Never Sees a PIN Still Needs

Most software platforms never touch a PIN: their terminals talk to a processor, and their online payments are tokenized before they reach the platform's servers. They still have keys worth this discipline:

- **Vault keys.** The key-encrypting key at the top of a card vault's envelope encryption belongs in this hierarchy, with a cryptoperiod and a rehearsed rotation like any other. [Running a Card Vault](/books/payments/card-vault#storing-the-number) covers the data keys beneath it and the re-encryption that rotation still leaves you to do.
- **Signing keys.** [Webhook](/docs/api-design/webhooks) signing secrets, API request signing, and the keys behind any token you issue are credentials an attacker can use to impersonate you. They get owners, rotation and storage in a secret manager or KMS, never in source ([Sensitive Data](/docs/payments/sensitive-data#secrets)).
- **Partner credentials.** Processor API keys and certificates for mutual TLS are keys too, with the same lifecycle.

The same three questions apply to all of them: where can the clear key exist, who can cause that, and how long until it's replaced?

## Auditing

Key records are evidence in a PCI DSS or PCI PIN assessment, in a network's review of a new connection, and in any investigation of a suspected compromise. The general design is in [Audit Trails](/docs/architecture/audit-trails), and [Logging Key Use](/docs/security/encryption-at-rest#logging-key-use) covers what a KMS records; for payment keys, make sure the record shows:

- **The key inventory as it stood on any date.** Each key's purpose, algorithm, strength, key block attributes, check value, cryptoperiod and status, versioned so an assessor can see what was live last March, not just today (the documented architecture 3.6.1.1 asks of service providers) ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Every ceremony, signed.** The script, the custodians and witnesses present, each component's and the final key's check values, and anything that deviated from the script, kept with the signatures that make it a record rather than a note.
- **Who held what.** Custodian assignments per component over time, so split knowledge can be shown to have held, including when a custodian left and the component was replaced.
- **Rotations and revocations with their reasons.** When each key was replaced, why (end of cryptoperiod or suspected compromise), and which partners confirmed the new key.

## What This Means for the System You Build

- **Keep clear keys inside HSMs.** Application code asks for operations, never for keys.
- **Accept only key blocks,** and enforce one purpose per key.
- **Build on AES** and treat every remaining TDES key as dated debt with an owner.
- **Automate key exchange and terminal key loading** so ceremonies are rare, scripted and witnessed.
- **Give every key a cryptoperiod, a key ID on its ciphertext, and a rehearsed rotation,** including the keys a platform holds even when it never sees a PIN.

## References

**Specifications**

- [NIST: FIPS 140-3](https://csrc.nist.gov/pubs/fips/140-3/final), four increasing levels of security for cryptographic modules
- [NIST: SP 800-131A Rev. 2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-131Ar2.pdf), two-key TDEA disallowed for encryption, three-key TDEA disallowed for encryption after 2023
- [NIST: SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final), general guidance on managing cryptographic keys, and the suggested cryptoperiods in its Table 1
- [PCI SSC: PCI DSS v4.0.1](https://www.pcisecuritystandards.org/document_library/), requirements 3.6.1.1, 3.6.1.2, 3.7.4 and 3.7.6 on key architecture, storage, cryptoperiods, split knowledge and dual control

**Reference**

- [Visa: Key block effective dates extended (PDF)](https://usa.visa.com/content/dam/VCOM/global/partner-with-us/documents/visa-security-bulletin-to-pin-participants-pci-extends-key-block-dates.pdf), requirement 18-3 and the three key block phases and dates
- [PCI SSC Blog: Cryptography expert on Triple DEA](https://blog.pcisecuritystandards.org/pci-ssc-cryptography-expert-on-triple-dea), two-key TDEA no longer strong cryptography, and the recommendation to move to AES
- [PCI SSC Blog: Key Blocks 104](https://blog.pcisecuritystandards.org/key-blocks-104), why key blocks protect a key's intended use
- [Wikipedia: Derived unique key per transaction](https://en.wikipedia.org/wiki/Derived_unique_key_per_transaction), AES DUKPT in ANSI X9.24-3-2017 and the TDES variant in its annex
- [Wikipedia: ISO 9564](https://en.wikipedia.org/wiki/ISO_9564), PIN block format 0, and the 2015 amendment adding an extended block for 128-bit ciphers
- [NIST: FIPS 140-3 transition](https://csrc.nist.gov/projects/fips-140-3-transition-effort), FIPS 140-2 validations moved to the historical list in September 2026

**In practice**

- [AWS: What is AWS Payment Cryptography?](https://docs.aws.amazon.com/payment-cryptography/latest/userguide/what-is.html), PCI PTS HSM V3 hardware, TR-31 and TR-34 key exchange, DUKPT and PIN translation
- [AWS: Translate PIN data](https://docs.aws.amazon.com/payment-cryptography/latest/userguide/translate-pin-data.html), PIN translation inside the HSM, AES Format 4 to TDES Format 0, and why a PIN can't move to a different card number
- [Microsoft: What is Azure Payment HSM?](https://learn.microsoft.com/en-us/azure/payment-hsm/overview), single-tenant payShield 10K devices under customer control
- [AWS: What is AWS CloudHSM?](https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html), single-tenant general-purpose HSMs at FIPS 140-2 or 140-3 Level 3
- [Google Cloud: Cloud HSM](https://docs.cloud.google.com/kms/docs/hsm), managed FIPS 140-2 Level 3 HSMs behind Cloud KMS
