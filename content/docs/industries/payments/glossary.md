+++
title = "Payments Glossary"
nav_title = "Glossary"
description = "Every term the payments volume uses, defined in a line and linked to the chapter that explains it: parties, card and bank terms, risk, security and law."
category = "Payments Industry"
order = 1430
part = "Reference"
tags = ["payments", "glossary", "reference"]
+++

Payments has more acronyms than most fields, and several words mean different things on different rails. Each entry here is one line and a link to where the volume explains it properly.

## Parties and Models

- **Acquirer:** the merchant's bank, a network member that signs merchants, carries their risk and pays them ([How Card Payments Work](/docs/industries/payments/card-payments#the-parties)).
- **Cardholder:** the person the card was issued to.
- **Gateway:** the service that takes a payment from a website or app and hands it to a processor.
- **ISO (independent sales organization):** a company that sells an acquirer's merchant accounts; not the standards body behind ISO 8583.
- **ISV (independent software vendor):** a software company, often vertical, that embeds payments in its product ([Payments for Software Platforms](/docs/industries/payments/software-platforms)).
- **Issuer:** the cardholder's bank, which approves or declines and pays for purchases.
- **Managed payfac:** a platform that runs payments under a provider's payment facilitator registration, with the provider holding the network relationship ([Payments for Software Platforms](/docs/industries/payments/software-platforms#four-ways-in)).
- **Merchant of record:** the party whose name is on the transaction and who is responsible for it to the cardholder.
- **Network:** Visa, Mastercard and the others; routes, clears and settles between issuers and acquirers and writes the rules. Four-party networks sit between banks they don't own; three-party networks (Amex, Discover) largely issue and acquire themselves.
- **Payment facilitator (payfac):** a company that signs merchants as sub-merchants under its own master account, registered with the networks through a sponsor ([Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider)).
- **Payment provider:** this volume's term for a company like Stripe, Adyen or Payabli that bundles gateway, processing and often acquiring behind one API.
- **Processor:** the company that runs the systems for an acquirer (front-end authorizations, back-end clearing and settlement) or an issuer ([Inside a Processor](/docs/industries/payments/inside-a-processor)).
- **Residuals:** a revenue share a provider pays a platform or reseller after the fact.
- **Sponsor bank:** the network member bank that lets a non-bank provider acquire or originate under its membership, and answers to the network for it.
- **Sub-merchant (sponsored merchant):** a merchant that processes under a payment facilitator's account.

## Card Payments

- **Authorization:** the issuer's approval of an amount, which places a hold and moves no money ([How Card Payments Work](/docs/industries/payments/card-payments#five-events-not-one-payment)).
- **ARN (acquirer reference number):** the identifier on each clearing record, cited by disputes and used to trace refunds ([Inside a Processor](/docs/industries/payments/inside-a-processor#clearing)).
- **BASE II, IPM:** Visa's and Mastercard's clearing file systems and formats.
- **AVS (address verification):** a check of the billing address, returned as a match result in the authorization.
- **BIN (bank identification number, or IIN):** the first six or eight digits of a card number, identifying the issuer and product ([How Card Payments Work](/docs/industries/payments/card-payments#bins)).
- **Capture:** the merchant confirming the amount it will collect.
- **Card-present (CP), card-not-present (CNP):** whether the card was physically read; it decides pricing, liability and fraud screening.
- **Card verification code:** the three or four digits on the card (CVV2, CVC2, CID), never stored after authorization.
- **CIT, MIT:** customer-initiated and merchant-initiated transactions; a saved card charged later is an MIT ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials)).
- **Clearing:** the acquirer sending captured transactions to the network, which prices them and passes them to issuers.
- **Dual message, single message:** authorization now and clearing by file later (credit, signature debit), or one message that does both (PIN debit, ATMs) ([Inside a Processor](/docs/industries/payments/inside-a-processor#dual-message-and-single-message)).
- **Downgrade:** a transaction priced at a worse interchange category because it was missing data or captured late ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing#downgrades)).
- **EIRF:** the electronic interchange reimbursement fee, the rate a transaction falls to when it misses its preferred category.
- **EMV Levels 1, 2 and 3:** terminal certification of the hardware, the kernel, and the integration end to end; unrelated to Level 2 and Level 3 data ([Network Certification](/docs/industries/payments/network-certification#card-present-emv-levels-1-2-and-3)).
- **Exempt debit:** debit from issuers small enough that Regulation II's interchange cap doesn't apply.
- **ECI (electronic commerce indicator):** the code in an authorization saying whether the payment was authenticated.
- **Estimated, incremental, final authorization:** an authorization for an amount that may change, an increase to one, and one for exactly the amount to be captured ([Payment States & Ledgers](/docs/payments/payment-states#holds-that-change-size)).
- **Funding:** the acquirer or provider paying the merchant; what a platform calls a payout.
- **Extended authorization:** a Visa card-absent authorization flagged to stay valid for 30 days instead of 10.
- **Fallback:** a chip card read by magnetic stripe or keyed because the chip failed, priced and risked as the weaker read.
- **Hold:** the reduction in a cardholder's available credit that an authorization causes, which expires if never captured.
- **ICA:** Mastercard's identifier for a member, the counterpart of Visa's acquiring identifier.
- **Interchange-plus:** pricing that passes interchange and network fees through at cost and adds a fixed markup ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing#pricing-models)).
- **Interchange:** the fee the acquirer pays the issuer on every card transaction, set by the networks' tables ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing)).
- **ISO 8583:** the message standard most card authorizations travel in ([How Card Payments Work](/docs/industries/payments/card-payments#iso-8583-what-s-on-the-wire)).
- **Level 2 and Level 3 data:** tax and customer code (Level 2) and line-item detail (Level 3) that lower interchange on commercial cards; Visa retired most Level 2 rates in April 2026, keeping them for fleet fuel ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing)).
- **Merchant discount:** what a merchant pays its acquirer for acceptance; merchants don't pay interchange directly.
- **Multiple capture:** capturing one authorization in pieces, for split shipments ([Payment States & Ledgers](/docs/payments/payment-states#holds-that-change-size)).
- **MCC (merchant category code):** four digits describing what a merchant sells, which decides interchange and program eligibility ([How Card Payments Work](/docs/industries/payments/card-payments#merchant-identity)).
- **MID, TID:** the merchant and terminal identifiers in every authorization.
- **MOTO:** mail order and telephone order, a card-not-present payment taken by phone or mail ([Phone Payments](/docs/industries/payments/phone-payments)).
- **MTI (message type indicator):** the four digits that say what an ISO 8583 message is.
- **PAN (primary account number):** the card number.
- **Overcapture:** clearing above the authorized amount, allowed by Visa only within set limits by merchant type.
- **Partial approval:** an authorization for less than requested.
- **Regulated debit:** US debit from issuers with $10 billion or more in assets, whose interchange is capped by Regulation II (the Durbin Amendment).
- **Presentment:** delivering a transaction for payment: a card's clearing record to the issuer, or a check to the paying bank.
- **Effective rate:** total fees divided by volume, the single number merchants compare.
- **Settlement:** the network netting issuers' and acquirers' positions and moving money between them.
- **Soft and hard decline:** a decline that may succeed later or with authentication, and one that never will for that card.
- **Stand-in processing (STIP):** the network approving or declining on an issuer's behalf when the issuer can't be reached or is too slow ([Inside a Processor](/docs/industries/payments/inside-a-processor#when-the-issuer-doesn-t-answer)).
- **Store and forward:** a terminal taking a card while offline and sending it for authorization once it reconnects, at the merchant's risk.
- **Statement descriptor:** what the cardholder sees on their statement.
- **STAN, RRN:** the trace numbers that identify an ISO 8583 message for reversals and lookups.
- **VisaNet, V.I.P.:** Visa's network, and the VisaNet Integrated Payment system that carries its authorizations ([Inside a Processor](/docs/industries/payments/inside-a-processor)).
- **Void:** cancelling an authorization before capture, which releases the hold; an authorization reversal.

## Authentication and Stored Cards

- **3-D Secure (3DS):** the protocol by which an issuer authenticates a cardholder online ([SCA & 3-D Secure](/docs/industries/payments/strong-customer-authentication)).
- **ACS, Directory Server, 3DS Server:** the issuer's authentication service, the network's routing service, and the merchant side's component in 3-D Secure.
- **Account updater:** a network service that refreshes stored card numbers and expiries when cards are reissued.
- **CAVV:** the authentication value from 3-D Secure, carried into the authorization as proof.
- **Cryptogram:** a one-time value proving a token or chip card was used for this transaction.
- **DPAN, FPAN:** a network token bound to a device, and the funding card number behind it ([Wallets & Local Payment Methods](/docs/industries/payments/wallets-and-local-methods)).
- **Frictionless, challenge:** a 3-D Secure authentication the cardholder never sees, and one where they're asked to prove who they are.
- **Liability shift:** moving fraud loss from merchant to issuer, by chip in person or by 3-D Secure online.
- **Network token:** a network-issued substitute for a PAN, scoped to a merchant or device and updated when the card changes ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials#keeping-the-card-alive)).
- **Network transaction ID:** the identifier from a card's first stored-credential transaction, referenced by every later one.
- **SCA (Strong Customer Authentication):** the European requirement for two-factor authentication on most online payments.
- **Token requestor:** the party registered with a network to request and hold network tokens, which decides who can use them elsewhere.
- **Vault token:** a random stand-in for a card or bank number, meaningful only to the vault that issued it ([Running a Card Vault](/docs/industries/payments/card-vault)).

## The Payments API

- **Client secret:** a value that lets one browser session confirm one payment, never stored or logged ([Designing the Payments API](/docs/industries/payments/payments-api#keys-and-the-client)).
- **Payment intent:** an object that lives across a whole payment attempt and its steps, such as 3-D Secure ([Designing the Payments API](/docs/industries/payments/payments-api#the-objects)).
- **Publishable, restricted and secret keys:** a key safe to put in a browser, a scoped server key, and an unrestricted server key.
- **Test clock:** simulated time in a test environment, to run subscriptions and disputes forward.
- **Thin event:** an event that carries only the type and the object's ID, so the receiver fetches the current object.
- **Transaction link identifier:** Mastercard's identifier tying the messages that follow an authorization to it ([Inside a Processor](/docs/industries/payments/inside-a-processor)).

## Risk and Disputes

- **Business email compromise:** fraud that redirects a payment by impersonating a vendor or executive ([Vendor Payouts](/docs/industries/payments/vendor-payouts#stopping-the-changed-bank-account)).
- **Card testing:** scripted attempts to check stolen card numbers with small payments ([Fraud & Risk](/docs/industries/payments/fraud-and-risk#card-testing)).
- **Chargeback (dispute):** the issuer taking money back from the merchant on the cardholder's behalf ([Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks)).
- **Clawback:** recovering funds from a merchant after payout, usually by ACH debit ([Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#clawbacks)).
- **Compelling Evidence 3.0, RDR, Order Insight, Ethoca:** network services that prevent or resolve disputes before they count against the merchant.
- **Early fraud warning (TC40):** an issuer's fraud report, which counts toward network ratios even without a dispute.
- **Funnel account:** an account receiving many deposits in one place, withdrawn elsewhere soon after, a laundering pattern ([Operating the Platform](/docs/industries/payments/operating-the-platform#compliance-operations)).
- **Friendly fraud:** a cardholder disputing a charge they made.
- **MATCH:** Mastercard's list of merchants terminated for cause.
- **Negative balance:** a merchant owing the platform more than its balance holds.
- **Representment:** the merchant's evidence-backed response to a chargeback.
- **Reserve:** merchant funds held back against future disputes and refunds: a dated hold, a rolling reserve or a fixed reserve ([Payouts & Settlement](/docs/industries/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)).
- **Transaction laundering:** a merchant processing payments for a business it doesn't disclose ([Fraud & Risk](/docs/industries/payments/fraud-and-risk#merchant-fraud)).
- **VAMP:** Visa's acquirer monitoring program, combining fraud reports and disputes into one ratio.

## Bank Payments

- **ACH:** the US batch network for bank credits and debits ([ACH & Bank Transfers](/docs/industries/payments/ach)).
- **ODFI, RDFI:** the originator's bank, which sends entries, and the receiver's bank.
- **Originator, Receiver:** the business that starts an ACH entry, and the account holder it credits or debits.
- **Nacha:** the association that writes the ACH rules; a Nacha file is the 94-character format entries travel in ([ACH & Bank Transfers](/docs/industries/payments/ach#anatomy-of-a-nacha-file)).
- **NOC (notification of change):** an RDFI's correction to outdated account details, posted instead of a return.
- **Prenote, micro-entries:** a zero-dollar test entry, and small credits used to verify an account.
- **Return, R-code:** an RDFI rejecting an entry, with a reason code such as R01 (insufficient funds) or R10 (unauthorized).
- **Reversal:** three different things. On cards, an authorization reversal (a void, ISO 8583 `0400`) that releases a hold; on ACH, an originator undoing its own erroneous entry within five banking days ([ACH & Bank Transfers](/docs/industries/payments/ach#reversals)); in some provider APIs, such as Adyen's, a request that cancels or refunds, whichever applies.
- **Same Day ACH:** ACH entries settled the day they're sent.
- **SEC code:** the code on an ACH batch stating how the payment was authorized: PPD, WEB, TEL, CCD, CTX, and the check conversion codes ARC, BOC, POP and RCK.
- **Third-Party Sender:** a company that originates ACH for others through its own bank relationship.
- **Banking day, calendar day:** windows in the rules are counted in one or the other, and they're different types ([Treasury & Bank Operations](/docs/industries/payments/treasury#the-banking-calendar)).

## Other Rails

- **Check 21, substitute check:** the law that let banks clear checks as images, and the legal paper copy printed from one ([Accepting Checks](/docs/industries/payments/checks)).
- **Fedwire, RTP, FedNow:** US wire transfers, and the two instant payment networks; all push, all final.
- **Interac:** Canada's domestic debit network ([Payments in Canada](/docs/industries/payments/canada)).
- **ISO 20022:** the XML message standard replacing older bank formats: `pain.001` instructs a credit transfer, `pain.002` reports its status, `camt.053` is a statement.
- **MICR line:** the magnetic-ink routing and account numbers along the bottom of a check.
- **Open banking:** regulated access for third parties to bank accounts, for data or to initiate payments.
- **PAD (pre-authorized debit):** Canada's direct debit, under Payments Canada's Rule H1.
- **RDC (remote deposit capture):** depositing checks by scanning them.
- **SEPA, Bacs, Pix, UPI:** the euro area's, the UK's, Brazil's and India's bank payment schemes ([Wallets & Local Payment Methods](/docs/industries/payments/wallets-and-local-methods)).
- **Fast Funds:** Visa's program requiring issuers to make pushed card payments available within 30 minutes ([Vendor Payouts](/docs/industries/payments/vendor-payouts#push-to-card)).
- **OCT, AFT:** a card network original credit transaction (pushing money to a card) and an account funding transaction (pulling money from one to fund something else) ([Vendor Payouts](/docs/industries/payments/vendor-payouts#push-to-card)).

## Money Movement and Treasury

- **BAI2, camt.053:** bank statement formats a reconciliation reads ([Treasury & Bank Operations](/docs/industries/payments/treasury)).
- **Pending, available balance:** money captured but not yet settled, and money past its availability date that can be paid out ([Payouts & Settlement](/docs/industries/payments/payouts-and-settlement)).
- **Application:** the record of what a payment paid for, separate from the payment itself ([Payment States & Ledgers](/docs/payments/payment-states#payments-are-applied-not-assigned)).
- **Escheatment:** turning unclaimed money over to the state after a dormancy period.
- **FBO account (for-benefit-of):** a bank account in the provider's name holding money for its merchants ([Treasury & Bank Operations](/docs/industries/payments/treasury#fbo-accounts-and-pass-through-insurance)).
- **Gross and net settlement:** paying merchants the full amount and collecting fees separately, or deducting fees from each payout; the same words describe how an acquirer settles to the provider ([Treasury & Bank Operations](/docs/industries/payments/treasury#funding-the-day)).
- **Pass-through insurance:** FDIC coverage that reaches each owner of a pooled custodial account, if the records allow it.
- **Safeguarding:** the UK regime protecting customer funds held by payment and e-money institutions ([Treasury & Bank Operations](/docs/industries/payments/treasury#safeguarding-outside-the-us)).
- **T+N:** a schedule where money captured on day T is available N business days later.
- **Virtual card:** a card number issued for one payable, with controls on amount, dates and merchant ([Vendor Payouts](/docs/industries/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate)).
- **Positive pay:** a file of issued checks the bank uses to reject altered or counterfeit ones.
- **Payout:** money leaving a merchant's balance for their bank account ([Payouts & Settlement](/docs/industries/payments/payouts-and-settlement)).
- **Prefunding, sweep:** moving money into an account ahead of payouts, and moving earned fees out of a custodial account.
- **Unapplied cash:** money received from a customer and not yet matched to a charge ([Payment States & Ledgers](/docs/payments/payment-states#payments-are-applied-not-assigned)).

## Security and PCI

- **AOC, ROC, SAQ:** PCI's attestation of compliance, report on compliance, and self-assessment questionnaire ([PCI DSS](/docs/compliance/pci-dss)).
- **ASV, QSA:** an approved scanning vendor and a qualified security assessor.
- **CDE (cardholder data environment):** every system that stores, processes or transmits card data, plus whatever can reach them.
- **DUKPT, BDK:** the scheme that gives every terminal transaction its own key, and the root key it derives them from ([HSMs & Key Management](/docs/industries/payments/key-management#dukpt-and-pin-blocks)).
- **Cryptoperiod:** how long a key may be used before it's replaced ([HSMs & Key Management](/docs/industries/payments/key-management#cryptoperiods-and-rotation)).
- **Capture token, stored token:** the short-lived token a browser gets, and the long-lived one the platform saves in exchange ([Running a Card Vault](/docs/industries/payments/card-vault#designing-the-token)).
- **Card fingerprint:** a keyed hash of a card number that recognizes the same card behind different tokens.
- **Envelope encryption:** data encrypted under a data key, which is itself encrypted under a key-encrypting key in a KMS or HSM.
- **Forwarder:** the vault component that swaps a token for the card number on the way to a processor, the only path a number takes out.
- **HSM, KMS:** a hardware security module, and a key management service, often built on HSMs.
- **Key block (TR-31), KCV:** a key wrapped with its permitted uses, and a key check value used to confirm a key without revealing it.
- **PIN block:** a PIN encrypted together with the card number, in an ISO 9564 format (format 4 for AES).
- **PFI (PCI Forensic Investigator):** the firm that investigates a card data compromise when a brand requires it ([Operating the Platform](/docs/industries/payments/operating-the-platform#when-card-data-is-exposed)).
- **P2PE:** point-to-point encryption of card data from the terminal to the decryption environment ([Card-Present Payments](/docs/industries/payments/card-present#p2pe-encrypt-at-the-glass)).
- **Remote key loading (TR-34):** delivering a terminal's first keys with asymmetric cryptography instead of in a key injection facility.
- **ZMK, ZPK:** a zone master key shared once with a partner, and the working PIN key it protects on that link ([HSMs & Key Management](/docs/industries/payments/key-management#the-key-hierarchy)).
- **PCI DSS:** the card industry's security standard for anyone handling card data.
- **Service provider:** in PCI terms, anyone who handles card data for other businesses; it brings extra requirements.

## Compliance and Law

- **A2P 10DLC:** carrier registration for business texting from ordinary 10-digit numbers ([Phone Payments](/docs/industries/payments/phone-payments#the-rules-for-texting)).
- **Backup withholding, B-notice:** 24% withheld from payments to a payee without a correct TIN, and the IRS notice that starts it.
- **AML, BSA, KYC, KYB:** anti-money-laundering programs, the Bank Secrecy Act that requires them, and knowing your customers and their businesses ([Merchant Onboarding](/docs/industries/payments/merchant-onboarding)).
- **CTR, SAR, Form 8300:** reports of large cash transactions, of suspicious activity, and of cash over $10,000 received by any business.
- **FinCEN:** the US Treasury bureau that enforces the Bank Secrecy Act.
- **Money transmission, MTMA:** holding or moving other people's money, licensed state by state, and the model law harmonizing those licenses ([Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider#holding-other-people-s-money)).
- **OFAC, SDN list:** the Treasury office that runs US sanctions, and its list of blocked persons.
- **Regulation E, Regulation Z:** consumer rights for electronic fund transfers and for credit cards ([The Payments Rulebook](/docs/industries/payments/payments-rulebook)).
- **Regulation CC:** US funds availability and check collection rules.
- **TCPA:** the US law governing automated calls and texts, including payment reminders.
- **1099-K:** the US tax form reporting payments settled to a merchant ([Payments for Software Platforms](/docs/industries/payments/software-platforms#1099-k-and-taxpayer-data)).

## References

**Reference**

- [Nacha: How ACH Works](https://achdevguide.nacha.org/how-ach-works), the ACH parties and SEC codes
- [PCI SSC: Document library](https://www.pcisecuritystandards.org/document_library/), PCI DSS and its glossary of terms
- [EMVCo: EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/), the 3-D Secure specification and its components
