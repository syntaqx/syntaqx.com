+++
title = "Card-Present Payments"
description = "How in-person card payments work: EMV chip cryptograms, cardholder verification, contactless, Tap to Pay, terminals, P2PE, and the risk of going offline."
category = "Payments Industry"
order = 1403
part = "How Money Moves"
tags = ["payments", "cards", "emv", "terminals", "card-present", "p2pe"]
+++

[How Card Payments Work](/books/payments/card-payments) drew the flow every card payment shares. In person, the front of that flow changes completely: there's a piece of hardware in the merchant's hands, a chip in the customer's card doing cryptography, and a set of decisions (online or offline, PIN or no PIN, chip or tap) made in the half second before anyone sees "approved". Online payments are a software problem with a fraud problem attached. Card-present payments are a hardware, firmware and key management problem, and the platforms that treat them as "just another payment method" find out the difference the first time a fleet of terminals needs a security patch.

This chapter is what changes when the card is physically there, and what it means for the system behind the counter.

## Why the Chip Exists

The magnetic stripe is a static recording. Copy it once, at a compromised gas pump or a skimmer on an ATM, and you can write it onto any blank card and spend it anywhere that reads stripes. Counterfeit fraud was the problem EMV (named for Europay, Mastercard and Visa, and now run by EMVCo, which American Express, Discover, JCB, Mastercard, UnionPay and Visa own together) was built to end.

The chip fixes it by doing cryptography for every transaction. It holds a secret key the issuer put there and never reveals it. When the terminal asks it to authorize, the chip signs the transaction details (amount, currency, date, a terminal-supplied random number, a counter that increases every time) into an **application cryptogram**. The issuer, which has the same key, recomputes the cryptogram and checks it. A copied card can't produce a valid cryptogram for a new transaction, and a recorded cryptogram is useless for any other one.

The card can answer the terminal three ways:

| Cryptogram | Meaning |
| ---------- | ------- |
| **ARQC** (Authorization Request Cryptogram) | Go online and ask the issuer |
| **TC** (Transaction Certificate) | Approved offline, without contacting the issuer |
| **AAC** (Application Authentication Cryptogram) | Declined offline |

On an online authorization, the issuer validates the ARQC and can return an **ARPC** (Authorization Response Cryptogram), which proves to the card that the answer came from its real issuer, sometimes with an issuer script that updates the card (a new PIN try limit, a blocked application).

![A chip transaction: the card produces an ARQC, the terminal sends it with the authorization through the acquirer and network to the issuer, which validates it and returns an approval with an ARPC; an offline approval or decline stays at the terminal.](/diagrams/card-present-emv.svg "The chip proves the card is real, every time. A fresh cryptogram travels with each authorization and only the issuer can check it; anything approved offline skips that check and carries the risk with it.")

For the systems behind the terminal, the point is that the cryptogram and the data elements around it travel to the issuer inside the authorization (in ISO 8583, data element 55). Your platform never computes or checks an ARQC unless it's an issuer processor, but it has to carry those bytes intact, and it has to record that the payment was **chip-read**, because that entry mode decides the liability, the interchange and the dispute rights later.

## Who Verifies the Cardholder

The cryptogram proves the card is genuine. A separate step, the **cardholder verification method** (CVM), proves the person holding it is the cardholder. The card carries a list of the methods its issuer accepts, in priority order, and the terminal picks the first one it supports:

- **Online PIN.** The terminal encrypts the PIN and sends it to the issuer to check. The strongest option, and the standard one for debit.
- **Offline PIN.** The chip itself checks the PIN, in the clear or enciphered with the card's public key. Common in Europe and Canada.
- **Signature.** Still on the list, and weak: nobody compares it to anything.
- **No CVM.** Allowed below limits each network and market sets, which is what makes a quick tap for a coffee possible.

Online PIN is the one with engineering consequences, because a PIN in transit is the most tightly regulated data in payments: it never exists in the clear outside a certified device, it's encrypted under keys that live only in hardware, and the platform's servers see only an encrypted PIN block. [HSMs & Key Management](/books/payments/key-management) covers what that takes.

## The Liability Shift

EMV adoption in the US wasn't driven by regulation. It was driven by moving the cost of fraud. In August 2011 Visa announced that from **October 1, 2015**, liability for counterfeit card-present fraud could shift to the acquirer of a merchant that hadn't adopted chip terminals, when the customer presented a chip card. Acquirers passed that to merchants, and the rational response was to buy chip terminals. Automated fuel dispensers got more time: an original date of October 1, 2017, later extended, with Visa finally setting **April 17, 2021**.

The engineering lesson isn't the dates. It's that the rule is "whoever invested less in security pays", and it applies per transaction. A chip card swiped on a chip-capable terminal because the chip read failed (**fallback**) is a stripe transaction for liability purposes. A platform that can't report entry mode per payment can't tell a merchant why it lost a counterfeit dispute, or why its fallback rate is a fraud signal worth alerting on.

## Contactless and Tap to Pay

Contactless is EMV over radio: the same cryptogram, the same issuer validation, a shorter exchange. Phone wallets add a layer, presenting a device-specific token (a [DPAN](/books/payments/card-payments#card-numbers-and-tokens)) instead of the card number, which the network maps back to the real card.

Two things here are newer than most platforms' assumptions:

- **Kernels.** The software on the terminal that runs a contactless transaction has historically been one kernel per network, each certified separately. In October 2022 EMVCo published a common EMV Contactless Kernel Specification (Kernel 8), and launched its testing process in October 2024, intended to reduce how many kernels terminals have to carry. Each network decides whether to adopt it, so until your networks have, assume your terminal vendor still ships several.
- **The phone as the terminal.** Tap to Pay on iPhone and on Android lets a merchant accept contactless cards on an ordinary phone, with no reader. The PCI Security Standards Council published **Mobile Payments on COTS** (MPoC, COTS being commercial off-the-shelf devices like phones) in November 2022 to cover exactly this: PIN and contactless card data entry on the same commercial device. The platform constraints are real, and each provider sets its own. As of October 2026, Stripe's Android implementation refuses rooted devices, requires Android 13 or later with a security patch from the past 12 months and hardware-backed key storage, and won't collect a PIN while screen recording or an accessibility service is running, while Adyen's Android SDK runs on Android 12 or later. Payabli offers Tap to Pay on iOS only, through its mobile SDK, on an iPhone XS or newer running iOS 16.7 or later; each phone attests itself on first use and stays pending until the merchant enters a one-time activation code. On iPhone every provider needs Apple's entitlement for the app, which Payabli warns can take two to eight weeks to approve. And PIN on a phone isn't universal: Stripe notes that many cards in Canada and Finland are offline PIN only, which a tap can't satisfy.

Tap to Pay is the fastest way for a software platform to put card-present acceptance in front of small merchants, because there's no hardware to ship. It's also a fleet you don't control: OS versions, device lists and attestation rules change under you, so the app has to check eligibility at runtime and fall back gracefully.

## Terminals and Where the POS Sits

A dedicated terminal is a certified secure device: tamper-responsive, approved under PCI's PIN Transaction Security (PTS) program for PIN entry, and loaded with keys in a controlled facility. How it connects to the merchant's point-of-sale software is the biggest scope decision in card-present work.

| Model | Card data path | What it means |
| ----- | -------------- | ------------- |
| **Standalone** | Terminal to processor; the POS isn't involved | Simple, but the clerk keys the amount twice and nothing reconciles automatically |
| **Integrated** | Card data passes through the POS application | The POS, its host and its network are in PCI scope, and the POS vendor certifies with every processor |
| **Semi-integrated** | The POS sends the amount; the terminal talks to the processor and returns only the result | The POS never touches card data, so it stays out of most PCI scope, and certification is the terminal's problem |

Providers sell the models side by side. Payabli, for one, splits its devices into two API methods: cloud terminals (the PAX A920, Ingenico's Link/2500 and Lane/7000) that take a sale sent through its API, and its AXIUM line of Ingenico terminals sold as semi-integrated devices, all encrypting card data at the point of capture under DUKPT keys injected at manufacture.

For a software platform building a POS, semi-integrated is almost always right. The POS should know the amount, the result and a token for refunds. It should never see a card number, because the moment it does, every install of your software is in somebody's PCI assessment.

Unattended terminals (kiosks, parking, vending, EV charging) add their own rules: no clerk to check anything, different CVM limits, often pre-authorization for an unknown final amount, and physical exposure that makes tamper detection matter more.

### Running a Fleet

A platform that ships terminals runs a hardware fleet, and the work doesn't end at the sale:

- **Terminal management.** A terminal management system pushes configuration, firmware and payment application updates, and reports health. Without it, a security patch means a site visit.
- **Key injection.** Every terminal needs its encryption keys before it can take a PIN or encrypt card data, loaded either in a secure key injection facility or remotely with asymmetric key exchange. [HSMs & Key Management](/books/payments/key-management) covers both.
- **Certification.** A terminal is approved in layers: EMV Level 1 (the physical and radio interface), Level 2 (the kernel), and Level 3, which tests the whole integration with an acquirer's host against test plans the networks provide. Change the payment application or the host integration and you may owe a new Level 3. [Network Certification](/books/payments/network-certification) covers the process.
- **Retirement.** PTS approvals expire. A device approved under an old version keeps working in the field for a while, but new deployments have to move to newer approvals, so the fleet always has a generation it's replacing.

## P2PE: Encrypt at the Glass

**Point-to-point encryption** encrypts card data inside the secure terminal at the moment it's read, and nothing can decrypt it until it reaches a secure decryption environment at the solution provider. The PCI SSC puts the benefit plainly: merchants using a PCI-listed P2PE solution have fewer applicable PCI DSS requirements, and the card data passing through their network is worthless to an attacker.

"Listed" is the operative word. Encryption alone, however good, gives no automatic scope reduction; a validated, listed P2PE solution does, and qualifies the merchant for the short P2PE self-assessment questionnaire ([PCI DSS](/docs/compliance/pci-dss)). If you're building for merchants, choose terminals and a processor with a listed solution and say so in your onboarding, because it's the difference between a short questionnaire and a long one for every merchant you sign.

## Offline: Approved Isn't Paid

A terminal that can't reach the network can still take a card, store the transaction and forward it later (**store and forward**). Sometimes the chip approves it offline with a TC; often the terminal simply stores it and attempts authorization when connectivity returns. Either way, the issuer hasn't said yes.

Stripe's documentation states the consequence without softening it: when you operate offline, you assume all decline and tamper-related risks, and if the issuer later declines, there's no way to recover the funds. It also caps a single offline payment at $10,000 and won't accept magnetic stripe offline at all, because stripe data is too easy to spoof. Adyen draws the same line: the merchant is fully liable for failed captures, chargebacks and disputes on payments approved offline, stripe reads are excluded, and each terminal gets a per-transaction ceiling and a maximum count of stored payments, while its mobile SDK stores and forwards for at most 24 consecutive hours.

So offline is a risk product, and the platform should treat it like one:

- **Per-transaction and cumulative limits,** set per merchant: no offline payments above an amount, and none at all once the stored total crosses a threshold.
- **A distinct state.** An offline payment is `collected_offline`, not `authorized`, until it's forwarded and authorized ([Payment States & Ledgers](/docs/payments/payment-states)). Don't fund the merchant against it, and show the merchant which payments are still at risk.
- **Fast forwarding,** and an alert when a device holds stored payments for too long, because a terminal that dies with unforwarded payments in it can mean lost money.

## Why Card-Present Is Cheaper

Chip and PIN make card-present payments the safest transactions in the system, and interchange reflects it. On Visa's table for debit cards from smaller issuers (the "exempt" ones Regulation II's cap doesn't reach), card-present retail costs about half what basic e-commerce does ([Interchange & Pricing](/books/payments/interchange-and-pricing) has the rates). That advantage only applies when the data proves the card was there: the right entry mode, the chip data, the terminal capabilities. A payment that falls back to stripe, or that a clerk keys in by hand, loses it.

## Auditing

Card-present payments are audited by acquirers after a counterfeit dispute, by PCI assessors for anything in the card data path, and by the merchant when a payment taken offline never arrives. The general design is in [Audit Trails](/docs/architecture/audit-trails); keep:

- **Entry mode, CVM and device on every payment:** chip, contactless, stripe, fallback or keyed, the verification method, and the serial number and software version of the terminal or phone that took it. Providers have started exposing this: Payabli's October 2026 release added the entry mode, the EMV authorization data and the device's serial number to transaction records and notifications, and device lists showing whether each terminal is online, busy or offline.
- **The fleet's history, per device:** where it was deployed, when its keys were injected and by whom, every firmware and payment application version it ran and when, and when it was retired. PCI DSS Requirement 9.5 has merchants keep a current list of the devices that read cards and inspect them for tampering or substitution, and on a platform that list is your data before it's theirs.
- **Offline payments end to end:** when each was stored, the limits in force on that device, when it was forwarded, and the issuer's answer, so a merchant's lost offline sale can be traced to a decline, a dead device or a limit.
- **Tap to Pay eligibility decisions:** each device's attestation result, activation and any refusal, so a merchant whose phone stopped accepting payments can be told why.

## What This Means for the System You Build

- **Record entry mode on every payment** (chip, contactless, stripe, fallback, keyed) and the CVM used. Liability, interchange, disputes and fraud screening all read it.
- **Keep the POS out of the card data path.** Semi-integrated terminals and a listed P2PE solution keep PCI scope on the terminal and the processor, not on every merchant's install of your software.
- **Treat terminals as a fleet** with management, key loading, firmware updates, certification and retirement on a schedule, not as a one-time shipment.
- **Model offline honestly:** a separate state, limits per merchant, and funding only after authorization.
- **Make Tap to Pay degrade gracefully,** checking device eligibility at runtime and falling back to a reader or a [payment link](/books/payments/phone-payments#send-a-link-instead).

## References

**Specifications**

- [EMVCo: EMV Contactless Kernel Specification published](https://www.emvco.com/news/emvco-publishes-emv-contactless-kernel-specification/), the common Kernel 8 specification of October 2022
- [EMVCo: EMV Contactless Kernel testing process launched (PDF)](https://emvco.com/wp-content/uploads/2024/10/ECK-Testing-PR_-FINAL-1.pdf), Kernel 8 testing available from October 16, 2024, as a full device or a standalone kernel
- [EMVCo: Overview](https://www.emvco.com/about/), owned collectively by American Express, Discover, JCB, Mastercard, UnionPay and Visa
- [EMVCo: What is Level 3 terminal integration testing?](https://www.emvco.com/knowledge-hub/what-is-level-3-terminal-integration-testing/), Level 1, Level 2 and Level 3 testing, and who writes the Level 3 test plans
- [PCI SSC: New standard for mobile payment solutions (MPoC)](https://www.pcisecuritystandards.org/about_us/press_releases/pci-ssc-publishes-new-standard-for-mobile-payment-solutions/), PIN and contactless entry on commercial devices, November 2022
- [PCI SSC: FAQ on Requirement 9.5](https://www.pcisecuritystandards.org/faqs/are-point-of-interaction-devices-required-to-be-physically-secured-for-example-with-a-cable-or-tether-to-prevent-removal-or-substitution-to-meet-pci-dss-requirement-9-5/), an up-to-date list of point-of-interaction devices and periodic inspection for tampering and substitution
- [PCI SSC: Point-to-Point Encryption](https://www.pcisecuritystandards.org/standards/point-to-point-encryption-p2pe/), fewer applicable PCI DSS requirements for merchants using listed P2PE solutions

**Reference**

- [Visa: Plans to accelerate chip migration (2011)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.1594598.html), the October 1, 2015 counterfeit liability shift and the original fuel dispenser date
- [NACS: EMV deadline moved to April 2021](https://www.convenience.org/Media/Daily/2020/May/4/1-EMV-Deadline-Moved-to-April-2021_GR), Visa's April 17, 2021 date for automated fuel dispensers
- [Wikipedia: EMV](https://en.wikipedia.org/wiki/EMV), application cryptograms (ARQC, TC, AAC), ARPC and cardholder verification methods

**In practice**

- [Adyen: Offline payments](https://docs.adyen.com/point-of-sale/offline-payment), merchant liability for offline approvals, no magnetic stripe, per-transaction and per-terminal count limits, and 24 hours on mobile
- [Adyen: Tap to Pay on Android](https://docs.adyen.com/point-of-sale/mobile-android/build/tap-to-pay), the SDK's Android 12 minimum
- [Payabli: Devices overview](https://docs.payabli.com/guides/pay-in-devices-overview), cloud and AXIUM semi-integrated devices, P2PE and DUKPT
- [Payabli: October 2026 release notes](https://docs.payabli.com/release-notes/october-2026), entry mode, EMV data and device serial numbers on transactions, and device online, busy or offline status
- [Payabli: Tap to Pay overview](https://docs.payabli.com/guides/pay-in-tap-to-pay-overview), iOS only, card-present interchange, and first-time device activation
- [Payabli: Accept Tap to Pay payments](https://docs.payabli.com/guides/pay-in-developer-tap-to-pay), iPhone XS or newer on iOS 16.7 or later, and Apple's entitlement taking two to eight weeks
- [Stripe: Tap to Pay on Android](https://docs.stripe.com/terminal/payments/setup-reader/tap-to-pay?platform=android), device requirements (Android 13, a security patch from the past 12 months), PIN entry conditions, and offline-PIN-only cards in Canada and Finland
- [Stripe: Tap to Pay on iPhone](https://docs.stripe.com/terminal/payments/setup-reader/tap-to-pay?platform=ios), the Apple entitlement and app review
- [Stripe: Collect card payments while offline](https://docs.stripe.com/terminal/features/operate-offline/collect-card-payments?terminal-card-present-integration=terminal&reader-type=internet&terminal-sdk-platform=android), who carries offline decline risk, the 10,000 USD offline cap, and no offline stripe
