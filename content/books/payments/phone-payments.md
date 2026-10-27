+++
title = "Phone Payments"
description = "Taking payments by phone and by link: MOTO and TEL rules, telephony in PCI scope, DTMF masking, text-to-pay, recordings, IVR design, remote agents."
category = "Payments Industry"
order = 1421
part = "Taking Payments"
tags = ["payments", "pci", "moto", "ivr", "contact-center", "ach"]
+++

[Stored cards](/books/payments/stored-credentials) are charged with nobody there. A phone payment has the customer present but not online, which puts it outside [3-D Secure](/books/payments/strong-customer-authentication) and inside rules of its own. It's card-not-present, but it's worse than a web checkout in one specific way: the card number passes through a person's ears and a phone system's plumbing before it reaches anything built to protect it. Call centers take hotel and airline bookings, insurance premiums, patient balances, catalog orders, collections and every payment from a customer who won't use the app, and each one can leave a card number in a recording, a transcript, a log line or an agent's notebook. This chapter covers the rules for phone payments and the architecture that keeps card data out of the call.

## The Rules for Taking a Payment by Phone

**Cards: mail order and telephone order (MOTO).** Visa defines it as a card-not-present purchase ordered "by telephone, mail, or other means of telecommunication". The authorization carries a MOTO indicator (single, recurring or installment; a card taken by phone for recurring use starts a [stored credential](/books/payments/stored-credentials)) instead of the e-commerce indicators that 3-D Secure produces, and there's no liability shift: fraud on a MOTO payment is the merchant's. You may ask for the card verification code, and should, but never store it after authorization, the same rule as everywhere else (PCI DSS 3.3.1.2, restated for phone orders in PCI SSC's FAQ 1319).

**Strong Customer Authentication doesn't apply,** in Europe, to genuine mail and telephone orders. PSD2 excludes them because the payer isn't initiating an electronic payment, and the EBA treats an IVR (interactive voice response, the automated phone menu) order the same as a call to an agent, unless the IVR is really initiating the payment over the internet. That gap has been abused: the EBA's 2022 advice on the PSD2 review found that some merchants "unlawfully qualified remote electronic payment transactions, initiated by the payer online, as MOTO in order to circumvent the application of SCA", and that MOTO fraud runs much higher than other payments. Flag a payment as MOTO only when it actually came by phone or mail; [SCA & 3-D Secure](/books/payments/strong-customer-authentication) covers the online alternative.

**Bank debits: TEL.** An ACH debit authorized by phone is a `TEL` entry ([ACH & Bank Transfers](/books/payments/ach)), and Nacha's rules are specific:

- **Explicit oral authorization** from the consumer, on the call. Pressing keys doesn't count as oral authorization.
- **Recorded, or confirmed in writing** before settlement, with the date, amount, consumer's name, a number to call with questions, the date of the authorization and a statement that it's an ACH debit.
- **Recurring TEL debits** have been allowed since 2011. They also need Regulation E's rules for preauthorized transfers, including sending the consumer a copy of the authorization, and the authorization states the amount or how it's determined, the timing, and how to revoke.
- **Only with an existing relationship, or when the consumer called you.** No outbound cold calls collecting bank details.
- **Kept for two years,** from the authorization for a single debit and from termination or revocation for a recurring one.

**Telemarketing narrows the menu further.** The FTC's Telemarketing Sales Rule has, since June 13, 2016, banned remotely created checks and payment orders and cash-to-cash money transfers as payment for anything sold through telemarketing, including inbound calls answering an advertisement. For any payment method other than a credit or debit card it requires "express verifiable authorization": written, or oral and audio-recorded with eight specific elements, or confirmed by mail before submission. If your phone payments ever touch sales calls, read 16 CFR 310 before designing the flow.

## The Phone System Is in Scope

PCI SSC's information supplement on telephone payments (version 3.0, November 2018) lists what card data on a call can reach: the SIP trunk or carrier link, the PBX (the office phone switch), the IVR, call recording and its storage and backups, speech analytics, the agent's desktop and softphone, screen recording, and a remote agent's home network. Voice and data share networks now, so without segmentation a single phone call can bring the whole office network into scope. A call from a customer isn't in scope until it reaches your infrastructure (FAQ 1153); from that moment, everything it touches is.

You can secure each of those systems to [PCI DSS](/docs/compliance/pci-dss) or you can design so card data never enters them. The supplement prefers the second, and I'd choose it too: securing an agent's desktop, a recording archive and an analytics pipeline to the standards of a cardholder data environment (CDE: every system that stores, processes or transmits card data, plus whatever can reach them) is an endless project, and the controls are only as good as the least careful agent.

## Keep the Digits Away From People

**DTMF masking** is the technique that makes phone payments manageable. The customer types the card number on their keypad. Before the tones reach the agent or the recorder, a component in the call path intercepts them and replaces them with flat tones (or removes them, which the supplement calls suppression), and sends the real digits out of band to the payment provider. The agent stays on the call, sees fields filling with asterisks, and can help a confused caller without ever hearing a digit. Recordings that contain only flat tones don't need protecting as card data, and the supplement notes a well-designed solution takes the telephony, the agent desktop and the CRM out of scope together.

![An agent-assisted phone payment with DTMF masking: the caller's keypad tones enter the masking service in the call path, which sends the real digits to the card vault and passes only flat tones on to the agent and the call recorder. The agent's screen shows asterisks filling in, and the vault returns a token and the last four digits to the platform. The real digits' path is accented.](/diagrams/phone-payments.svg "The digits leave the call before anyone can hear them. The agent and the recording get flat tones; the vault gets the card number and the platform gets a token, the same as a web checkout.")

The details decide whether it works:

- **Where masking sits.** Off premises, a provider receives the call first and forwards it with the tones masked; on premises, a device in your network does it, and that device and the switch around it stay in scope. Off premises takes more out of scope.
- **Tone bleed.** Masking that detects tones can let the first few milliseconds of each through, enough to reconstruct digits. Test for it, and keep testing.
- **Digits in signaling.** DTMF often travels as telephony events in the media stream's signaling (RFC 4733) rather than as audio. A design that mutes the audible tone but forwards those events has masked nothing for any component that reads them.
- **Transfer to a payment IVR** is the alternative: the agent hands the caller to an automated flow, yours or your provider's, which collects the card and hands the caller back. It takes the agent out of the path, if the transfer really bypasses them.

Cloud contact centers have built-in versions, and each has a trap:

- **Amazon Connect's "Store customer input" block** can encrypt keypad input with your public key, so only your card service, holding the private key, can decrypt it with the AWS Encryption SDK. Ordinary contact attributes land in contact records that agents can see, and flow logs record what passes to Lambda functions and Lex bots. Use encryption, never put card data in an ordinary attribute, and turn flow logging off around the capture.
- **Genesys Cloud's secure flows** hide input from recording and agents, but protocol capture, a debugging feature, logs everything entered, including secure flow data, unencrypted, unless the PCI setting disables it.
- **Twilio's `<Pay>`** collects card or bank details by keypad and sends them to a payment connector, redacting the digits from logs. It requires the account's PCI Mode, which redacts sensitive data from every log in the account and can't be turned off; Twilio suggests a separate account for payments, and PCI Mode disables its native transcription.

A payment provider's own IVR usually sits on the same kind of platform. Payabli's is built on SharpenCX (formerly Plum Voice), a PCI-compliant IVR vendor: the call tree runs there, not at Payabli, looks the caller up against the platform's API, collects the card or bank details by keypad, and posts the payment straight to Payabli marked as an IVR payment. The platform's own systems see the account lookup and the result, never the digits. For bank payments, Payabli's guide adds the Nacha requirements to the call tree: a verbal authorization prompt and a confirmation sent to the caller.

Whichever you use, what comes out of the capture should be what a web checkout produces: a token from your [card vault](/books/payments/card-vault), the brand and the last four digits, and nothing the contact center platform can replay.

## Send a Link Instead

The simplest way to keep card data out of a call is to take the payment out of the call: the agent, or an automated message, sends the customer a link, and the customer pays on a hosted payment page on their own phone. The same link works by text or email for a patient balance after a visit, a deposit on a booking, or a B2B invoice, which is why "text to pay" is a product of its own.

- **It's an online payment now, not MOTO.** The customer is entering their own card in a browser, so 3-D Secure applies and its liability shift is available: the legitimate version of what the EBA criticized above.
- **The link is a bearer token.** Anyone holding it can pay, and some links show a name and balance, so it's single-use, bound to one amount and payee, expiring, and carries no personal data in the URL. Behind it is a payment in `pending`, created with an [idempotency key](/docs/payments/idempotency), so a customer tapping twice pays once. Providers set their own bounds: Adyen's payment links are single-use unless marked reusable and expire 24 hours after creation unless given a date up to 70 days out, Payabli's pay-by-SMS links expire after 3 days, and Stripe's checkout sessions expire between 30 minutes and 24 hours after creation. Building links for a provider: [Links That Can't Be Tampered With](/books/payments/checkout-and-invoicing#links-that-can-t-be-tampered-with).
- **The page is hosted, never the message.** PCI DSS forbids sending unprotected card numbers by end-user messaging, and PCI SSC's FAQ 1085 names email, SMS, chat and instant messaging (requirement 4.2.2). The link opens your [hosted fields](/books/payments/card-vault#getting-the-card-in); nobody ever replies with card details.

### The Rules for Texting

Sending payment links by text brings its own rules:

- **Texting consumers needs consent.** Under the TCPA, automated texts to a mobile number need prior express consent, and marketing texts need prior express written consent. A payment reminder to a customer who gave their number for account messages is informational; add a coupon and it's marketing. Some providers build the opt-in into the product: Payabli's pay by SMS sends a customer who hasn't opted in an opt-in request first, and the confirmation text carries the STOP keyword. Revocation rules change once the FCC's order FCC 26-67, adopted September 30, 2026, takes effect, 30 days after it's published in the Federal Register: a customer who stops one kind of informational message no longer stops them all; [Consumer Contact](/docs/compliance/consumer-contact#revoking-consent) has the sequence and what to record.
- **Carriers have rules too.** Business texting from ordinary 10-digit numbers requires A2P 10DLC registration (the carriers' system for application-to-person texts from 10-digit numbers) of your brand and each campaign, and US carriers have blocked texts from unregistered numbers since September 2023. CTIA's messaging principles, the industry's guidance, expect an opt-in for each purpose and a working opt-out.
- **Assume impostors.** Fake payment texts are among the most common scams, and the FTC tells consumers that legitimate companies don't ask for account details by text. Send from one recognizable sender and domain, never ask for a reply with payment details, put the amount and what it's for in the message, and tell customers what a real link looks like, so the next fake one stands out.

## Recordings

Call recordings are where phone payments most often break PCI DSS, because they're made by default, kept for years, and copied to backups and analytics.

- **Pause and resume is a weak control.** Stopping the recording during payment takes the recorder out of scope at best and leaves the agent and their desktop in. Manual pausing fails when an agent forgets to pause (card data recorded) or forgets to resume (the rest of the call lost, which can break your own retention obligations). Automated pausing, triggered when the agent opens the payment screen, can be bypassed by an agent who takes the number another way. If you rely on it, check recordings for card data regularly; the supplement suggests weekly.
- **The security code must never persist in a recording.** PCI SSC's FAQ 1210, updated June 2025, says storing a card verification code in a digital audio recording after authorization violates requirement 3.3.1.2, even encrypted. Prevent it from being recorded, redact it if your platform can, or delete it once the authorization completes. Only where none of that is technically possible does the FAQ allow compensating controls, documented, risk-assessed every year and validated by your assessor. Backups and archives are recordings too.
- **Consent to record** is a separate law. Federal law needs one party's consent, but a minority of states, California, Illinois and Washington among them, require everyone's, and you rarely know which state a caller is in. Announce recording at the start of every call ([Consumer Contact](/docs/compliance/consumer-contact#recording-calls)).

## Speech, Transcripts and AI

A card number spoken aloud becomes text the moment anything transcribes the call, and that text is cardholder data wherever it lands: a transcript, a speech analytics index, a model's context window. The supplement warns that analytics are designed to categorize and locate exactly this kind of data. Vendor redaction helps less than it sounds: Amazon Lex obfuscates recognized slot values in its conversation logs but not in the audio, in session attributes, or in prompts that read a value back, and contact-center redaction typically runs after the call, keeping unredacted originals.

So card digits are collected by keypad, never by speech recognition, and transcription and AI assistants are kept off the payment segment of the call. [AI Security](/docs/security/ai-security) covers the broader problem of what a model sees.

## Designing the IVR

- **Validate before submitting.** Card length, brand prefix and the Luhn check digit run in the flow, so a mistyped number is caught while the caller is still on the line, and the expiry and security code are checked for shape. A decline from the processor costs the call; a validation prompt costs a second.
- **Read back the last four digits only,** and never the security code. PCI DSS caps a displayed number at the BIN and last four (3.4.1), and a read-back is a display.
- **Timeouts that fit fumbling for a card.** Amazon Connect defaults to five seconds between digits and lets the first entry wait longer; give people time to find the card, and let a key (often `*`) clear and restart.
- **Rate-limit the line.** A keypad payment line is a card-testing endpoint with no CAPTCHA; apply the same per-card and per-caller limits as [Fraud & Risk](/books/payments/fraud-and-risk#card-testing).
- **Don't transfer mid-capture.** Digits a caller types ahead during a transfer between flows can be dropped, and a partial number gets submitted.
- **Charge idempotently.** The flow may retry after a timeout; the payment request carries an [idempotency key](/docs/payments/idempotency) so a retry can't charge twice. Twilio's agent-assisted payment API requires one.
- **Plan the failure paths.** When masking or the IVR is down, the fallback must still keep card data out of recordings and agents' hands, and callers who can't use a keypad need a spoken path, handled by trained staff with recording off and the data destroyed after use. A fallback nobody designed becomes the agent writing the number down.

## Remote Agents

A home agent who hears card numbers puts a home network, a personal room and whatever recording devices are in it into your environment. The supplement's controls for that case are long: MFA into anything that handles card data, encrypted connections, removable media and local drives disabled, masked card numbers on screen, no phones or notebooks at the desk, and annual training. Every one of them is easier to satisfy when masking means the agent never hears a digit in the first place.

## Auditing

Phone payment records are evidence in a PCI assessment, in an ACH dispute over a TEL authorization, in a TCPA claim over a text, and in an investigation into how a card number got out. The general design is in [Audit Trails](/docs/architecture/audit-trails); for phone payments, make sure the record shows:

- **How every payment was captured:** agent-assisted with masking, payment IVR, or link, with the channel indicator sent in the authorization, so a MOTO flag can be shown to match a real phone or mail order.
- **Every TEL authorization,** the recording or the written confirmation, its required elements and when it was sent, kept for the two years Nacha requires.
- **Consent and opt-outs for every number texted,** with the purpose, the source of the consent and each revocation, since the TCPA claim turns on them ([Consumer Contact](/docs/compliance/consumer-contact#revoking-consent)).
- **Every payment link issued,** to which number or address, for what amount, when it expired, and whether it was paid.
- **The recording-scan results,** the periodic checks for card data in recordings and transcripts, with what was found and deleted.

## What This Means for the System You Build

- **MOTO flagged only for real phone and mail orders,** with the security code requested and never stored.
- **TEL debits with recorded oral authorization** and the required elements, kept two years, and no telemarketing payment methods the TSR bans.
- **DTMF masking or a payment IVR** so card digits never reach agents, recordings or the CRM, with tone bleed and signaling events tested.
- **Payment links** that are single-use, expiring and hosted, sent with consent from a registered sender, so the payment leaves the call entirely.
- **Contact-center traps closed:** encrypted capture, no card data in attributes or logs, PCI modes enabled where they exist.
- **Recordings that can't hold a security code,** consent announced on every call, and keypad entry, never speech, for card digits.
- **An IVR that validates, reads back four digits, charges idempotently** and has a designed fallback.

## References

**Specifications**

- [PCI SSC: Protecting Telephone-Based Payment Card Data](https://listings.pcisecuritystandards.org/documents/Protecting_Telephone_Based_Payment_Card_Data_v3-0_nov_2018.pdf), telephony scope, DTMF masking, pause and resume, recordings and remote agents (v3.0, November 2018)
- [PCI SSC: FAQ 1210](https://www.pcisecuritystandards.org/faqs/1210/), card verification codes in audio recordings
- [PCI SSC: FAQ 1319](https://www.pcisecuritystandards.org/faqs/1319/), requesting but not storing the card verification code for card-not-present payments
- [PCI SSC: FAQ 1153](https://www.pcisecuritystandards.org/faqs/1153/), how PCI DSS applies to VoIP
- [16 CFR Part 310: Telemarketing Sales Rule](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-310), express verifiable authorization, the eight elements of a recorded oral authorization in 310.3(a)(3)(ii), and the bans on remotely created payment orders and cash-to-cash transfers
- [Federal Register: Telemarketing Sales Rule, final rule (80 FR 77520)](https://www.federalregister.gov/documents/2015/12/14/2015-30761/telemarketing-sales-rule), the payment method bans effective June 13, 2016
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), the mail/phone order definition and card-not-present disputes
- [PCI SSC: PCI DSS v4.0.1](https://www.pcisecuritystandards.org/document_library/), requirements 3.3.1.2 (no card verification code after authorization), 3.4.1 (masking a displayed number) and 4.2.2 (card numbers over end-user messaging)
- [47 CFR 64.1200](https://www.ecfr.gov/current/title-47/section-64.1200), TCPA consent for texts and revocation by any reasonable means
- [PCI SSC: FAQ 1085](https://www.pcisecuritystandards.org/faqs/1085), card numbers over email, SMS, chat and other end-user messaging

**Reference**

- [EBA: Q&A 2018_4058](https://www.eba.europa.eu/single-rule-book-qa/qna/view/publicId/2018_4058), IVR telephone orders and the scope of SCA
- [EBA: Opinion on the review of PSD2](https://www.dirittobancario.it/wp-content/uploads/2022/06/EBAs-response-to-the-Call-for-advice-on-the-review-of-PSD2.pdf), MOTO fraud rates and misuse of the MOTO flag (EBA/Op/2022/06)
- [Nacha: Meaningful Modernization](https://www.nacha.org/rules/meaningful-modernization), oral authorizations, TEL, recurring and standing authorizations, and retention
- [Nacha: Comment letter on recurring TEL debits (2013)](https://www.ftc.gov/sites/default/files/documents/public_comments/2013/08/00028-86275.pdf), recurring telephone authorizations allowed since 2011
- [RFC 4733: RTP Payload for DTMF Digits](https://www.rfc-editor.org/rfc/rfc4733), keypad digits carried as telephony events
- [18 U.S.C. 2511](https://www.law.cornell.edu/uscode/text/18/2511), the federal one-party consent rule for recording
- [FCC 26-67: TCPA consent revocation order](https://docs.fcc.gov/public/attachments/FCC-26-67A1.pdf), opt-out scope and designated opt-out methods, adopted September 30, 2026
- [DLA Piper: FCC TCPA rule](https://www.dlapiper.com/en/insights/publications/2026/10/fcc-tcpa-rule), October 2026: revocation of an informational message scoped to that category, effective 30 days after Federal Register publication
- [CTIA: Messaging Principles and Best Practices](https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf), consent per messaging purpose and opt-out handling
- [FTC: How to recognize and report spam text messages](https://consumer.ftc.gov/articles/how-recognize-and-report-spam-text-messages), fake payment and account texts

**In practice**

- [Adyen: Create a payment link](https://docs.adyen.com/api-explorer/Checkout/latest/post/paymentLinks), single-use by default, 24-hour default expiry and a 70-day maximum
- [Amazon Connect: Store customer input](https://docs.aws.amazon.com/connect/latest/adminguide/store-customer-input.html), encrypted keypad capture and its timeouts
- [Amazon Connect: Encrypt customer input](https://docs.aws.amazon.com/connect/latest/adminguide/encrypt-data.html), public-key encryption and decrypting with the AWS Encryption SDK
- [Amazon Connect: Flow logs](https://docs.aws.amazon.com/connect/latest/adminguide/contact-flow-log-data.html), what's logged from Lambda and Lex interactions
- [Amazon Lex: Obfuscating slot values](https://docs.aws.amazon.com/lexv2/latest/dg/monitoring-obfuscate.html), what slot obfuscation does and doesn't cover
- [Twilio: `<Pay>`](https://www.twilio.com/docs/voice/twiml/pay), keypad payment capture and redaction
- [Twilio: PCI workflows](https://www.twilio.com/docs/voice/pci-workflows), PCI Mode and why it can't be disabled
- [Genesys Cloud: Secure flows](https://help.genesys.cloud/110267), hiding input from agents and recordings, and the protocol capture warning
- [Payabli: IVR payments](https://docs.payabli.com/guides/pay-in-ivr-overview), the call tree on SharpenCX, keypad capture posted directly to Payabli, and Nacha requirements for ACH by IVR
- [Payabli: Pay by SMS](https://docs.payabli.com/guides/pay-in-developer-invoices-pay-by-sms), the opt-in flow with the STOP keyword and links that expire after 3 days
- [Kilpatrick: Wiretap laws in the United States](https://ktslaw.com/en/Insights/Alert/2024/7/Wiretap-Laws-in-the-United-States), one-party and all-party consent states
- [Twilio: Shutdown of unregistered 10DLC messaging](https://support.twilio.com/hc/en-us/articles/14910496447771-Shutdown-of-Unregistered-10DLC-Messaging), carrier blocking of unregistered numbers since September 2023
- [Stripe: Checkout session expiration](https://docs.stripe.com/payments/checkout/managing-limited-inventory), payment sessions that expire between 30 minutes and 24 hours
