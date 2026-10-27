+++
title = "Payments Glossary"
nav_title = "Glossary"
description = "Every term the payments volume uses, defined in a line and linked to its chapter: rails, rules, taking payments, paying out and running a provider."
category = "Payments Industry"
order = 1437
part = "Reference"
tags = ["payments", "glossary", "reference"]
+++

Payments has more acronyms than most fields, and several words mean different things on different rails (reversal, settlement and return are the worst offenders). Providers also name the same thing differently: one provider's connected account is another's account holder or sub-merchant. Entries are grouped by the part of the volume that explains them, alphabetized within each group, and each is one line and a link. The volume's own names for the core records (merchant, payment, attempt, refund, dispute, payout, ledger entry) are the ones in [The Core Data Model](/books/payments/card-payments#the-core-data-model).

## How Money Moves

- **AAC, ARQC, TC:** the chip's application authentication cryptogram (decline offline), authorization request cryptogram (go online) and transaction certificate (approve offline) ([Card-Present Payments](/books/payments/card-present#why-the-chip-exists)).
- **ACH:** the US batch network for bank credits and debits ([ACH & Bank Transfers](/books/payments/ach)).
- **ACSS, Lynx:** Canada's batch clearing system for everyday payments, and its high-value real-time gross settlement system ([Payments in Canada](/books/payments/canada#the-rails)).
- **Acquirer:** the merchant's bank, a network member that signs merchants, carries their risk and pays them ([How Card Payments Work](/books/payments/card-payments#the-parties)).
- **ARN (acquirer reference number):** the identifier on each clearing record, cited by disputes and used to trace refunds ([Inside a Processor](/books/payments/inside-a-processor#clearing)).
- **ARPC:** the issuer's response cryptogram, which the chip checks to confirm the approval really came from its issuer ([Card-Present Payments](/books/payments/card-present#why-the-chip-exists)).
- **Authorization:** the issuer's approval of an amount, which places a hold and moves no money ([How Card Payments Work](/books/payments/card-payments#five-events-not-one-payment)).
- **AVS (address verification):** a check of the billing address, returned as a match result in the authorization.
- **BASE II, IPM:** Visa's and Mastercard's clearing file systems and formats.
- **BIN (bank identification number, or IIN):** the first six or eight digits of a card number, identifying the issuer and product ([How Card Payments Work](/books/payments/card-payments#bins)).
- **BNPL (buy now, pay later):** a lender paying the merchant up front and collecting from the customer in installments ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#buy-now-pay-later)).
- **Capture:** the merchant confirming the amount it will collect.
- **Card-present (CP), card-not-present (CNP):** whether the card was physically read; it decides pricing, liability and fraud screening.
- **Card verification code:** the three or four digits on the card (CVV2, CVC2, CID), never stored after authorization.
- **Cardholder:** the person the card was issued to.
- **Check 21, substitute check:** the law that let banks clear checks as images, and the legal paper copy printed from one ([Accepting Checks](/books/payments/checks)).
- **Clearing:** the acquirer sending captured transactions to the network, which prices them and passes them to issuers.
- **Click to Pay:** the networks' checkout for browsers without a wallet, built on EMVCo's Secure Remote Commerce, which delivers a network token ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#wallets-are-cards-in-disguise)).
- **Contactless, Tap to Pay:** paying by tapping a card or phone on a reader, and accepting taps on an ordinary phone with no reader ([Card-Present Payments](/books/payments/card-present#contactless-and-tap-to-pay)).
- **Correspondent bank, nostro, vostro:** a bank holding accounts in a currency's home country for banks that don't; the sender's account there is its nostro (ours, held with you), which the correspondent sees as a vostro ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#wires-swift-correspondents-and-iso-20022)).
- **Cross-border assessment:** a network fee on a transaction whose merchant and issuer are in different countries, such as Mastercard's US Cross Border fee, higher when not settled in US dollars ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#what-cross-border-costs)).
- **CVM (cardholder verification method):** how a terminal confirms the holder is the cardholder (PIN, signature, the phone's own unlock, or nothing), chosen from the card's list ([Card-Present Payments](/books/payments/card-present#who-verifies-the-cardholder)).
- **DCC (dynamic currency conversion):** offering a foreign cardholder the price in their own currency at a rate the merchant's provider sets, under network rules on choice and disclosure ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#dynamic-currency-conversion)).
- **Downgrade:** a transaction priced at a worse interchange category because it was missing data or captured late ([Interchange & Pricing](/books/payments/interchange-and-pricing#downgrades)).
- **DPAN, FPAN:** a network token bound to a device, and the funding card number behind it ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods)).
- **Dual message, single message:** authorization now and clearing by file later (credit, signature debit), or one message that does both (PIN debit, ATMs) ([Inside a Processor](/books/payments/inside-a-processor#dual-message-and-single-message)).
- **ECI (electronic commerce indicator):** the code in an authorization saying whether the payment was authenticated.
- **Effective rate:** total fees divided by volume, the single number merchants compare; Canada's code of conduct requires it per card type on statements ([Payments Metrics](/books/payments/payments-metrics#revenue-and-cost)).
- **EIRF:** the electronic interchange reimbursement fee, the rate a transaction falls to when it misses its preferred category.
- **Estimated, incremental, final authorization:** an authorization for an amount that may change, an increase to one, and one for exactly the amount to be captured ([Payment States & Ledgers](/docs/payments/payment-states#holds-that-change-size)).
- **Exempt debit:** debit from issuers small enough that Regulation II's interchange cap doesn't apply ([Interchange & Pricing](/books/payments/interchange-and-pricing#regulated-debit)).
- **Extended authorization:** a Visa card-absent authorization flagged to stay valid for 30 days instead of 10.
- **Fallback:** a chip card read by magnetic stripe or keyed because the chip failed, priced and risked as the weaker read.
- **Fedwire, RTP, FedNow:** US wire transfers, and the two instant payment networks; all push, all final.
- **Funding:** the acquirer or provider paying the merchant; what a platform calls a payout.
- **Funding currency:** the currency of the bank account a merchant's payout goes to, a third currency beside presentment and settlement ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#three-currencies-not-two)).
- **Gateway:** the service that takes a payment from a website or app and hands it to a processor.
- **gpi:** Swift's service for tracking a cross-border payment across the chain of banks, with the amount visible end to end ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#wires-swift-correspondents-and-iso-20022)).
- **Hold:** the reduction in a cardholder's available credit that an authorization causes, which expires if never captured.
- **Honor all cards:** the network rule that a merchant accepting a brand accepts all its cards; the pending US merchant settlement would loosen it for credit categories ([Interchange & Pricing](/books/payments/interchange-and-pricing#credit-and-the-merchant-settlement)).
- **ICA:** Mastercard's identifier for a member, the counterpart of Visa's acquiring identifier.
- **Image cash letter (X9.100-187):** the file format in which banks exchange check images and their data ([Accepting Checks](/books/payments/checks#the-image-and-the-micr-line)).
- **Interac:** Canada's domestic debit network ([Payments in Canada](/books/payments/canada#interac)).
- **Interchange:** the fee the acquirer pays the issuer on every card transaction, set by the networks' tables ([Interchange & Pricing](/books/payments/interchange-and-pricing)).
- **Interchange-plus:** pricing that passes interchange and network fees through at cost and adds a fixed markup ([Interchange & Pricing](/books/payments/interchange-and-pricing#pricing-models)).
- **ISA, IAF:** Visa's International Service Assessment, charged when the merchant's and issuer's countries differ, and its International Acquirer Fee on non-US cards acquired by US merchants ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#what-cross-border-costs)).
- **ISO 8583:** the message standard most card authorizations travel in ([How Card Payments Work](/books/payments/card-payments#iso-8583-what-s-on-the-wire)).
- **ISO 20022:** the XML message standard replacing older bank formats: `pain.001` instructs a credit transfer, `pain.002` reports its status, `camt.053` is a statement.
- **ISO (independent sales organization):** a company that sells an acquirer's merchant accounts; not the standards body behind ISO 8583.
- **Issuer:** the cardholder's bank, which approves or declines and pays for purchases.
- **Kernel:** the EMV software in a terminal that runs the card's transaction logic, certified as EMV Level 2 ([Card-Present Payments](/books/payments/card-present#contactless-and-tap-to-pay)).
- **Level 2 and Level 3 data:** tax and customer code (Level 2) and line-item detail (Level 3) that lower interchange on commercial cards; Visa retired most Level 2 rates in April 2026, keeping them for fleet fuel ([Interchange & Pricing](/books/payments/interchange-and-pricing#level-2-and-level-3-data)).
- **Local acquiring:** processing through an acquirer and merchant outlet in the card's own country, so the payment is priced and judged as domestic ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#local-acquiring-and-local-entities)).
- **Lockbox:** a bank service that receives a business's mailed checks, deposits them and sends the remittance data ([Accepting Checks](/books/payments/checks#lockbox)).
- **MCC (merchant category code):** four digits describing what a merchant sells, which decides interchange and program eligibility ([How Card Payments Work](/books/payments/card-payments#merchant-identity)).
- **MCP (multi-currency pricing):** the merchant pricing and charging in the customer's currency, with conversion between acquirer and merchant at settlement ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#multi-currency-pricing-versus-conversion-at-checkout)).
- **MED:** Pix's special return mechanism, through which a payer's bank can recover funds in fraud cases ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull)).
- **Merchant discount:** what a merchant pays its acquirer for acceptance; merchants don't pay interchange directly.
- **Merchant outlet location:** the country an acquirer assigns a merchant (where a card-present sale happens, the principal place of business for card-absent), which decides whether a payment is cross-border ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#what-makes-a-card-payment-cross-border)).
- **MICR line:** the magnetic-ink routing and account numbers along the bottom of a check.
- **MID, TID:** the merchant and terminal identifiers in every authorization.
- **MPoC:** PCI's Mobile Payments on COTS standard for accepting cards (and PINs) on commercial off-the-shelf phones ([Card-Present Payments](/books/payments/card-present#contactless-and-tap-to-pay)).
- **MTI (message type indicator):** the four digits that say what an ISO 8583 message is.
- **Network:** Visa, Mastercard and the others; routes, clears and settles between issuers and acquirers and writes the rules. Four-party networks sit between banks they don't own; three-party networks (Amex, Discover) largely issue and acquire themselves, and Discover has belonged to Capital One since May 2025 ([How Card Payments Work](/books/payments/card-payments#the-parties)).
- **Offline approval, store and forward:** a terminal approving without reaching the issuer and sending the transaction once it reconnects, at the merchant's risk ([Card-Present Payments](/books/payments/card-present#offline-approved-isn-t-paid)). Not the same as stand-in, where the network answers for an issuer it can't reach.
- **Open banking:** regulated access for third parties to bank accounts, for data or to initiate payments.
- **OptBlue:** American Express's program for smaller merchants, under which their ordinary acquirer signs and prices them for Amex ([Interchange & Pricing](/books/payments/interchange-and-pricing#pricing-models)).
- **OUR, SHA, BEN:** the charge-bearer codes on a wire: the sender pays every fee, each side pays its own bank, or the beneficiary bears them all ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#wires-swift-correspondents-and-iso-20022)).
- **PAN (primary account number):** the card number.
- **Partial approval:** an authorization for less than requested.
- **Payment provider:** this volume's term for any company that bundles gateway, processing and often acquiring behind one API, such as Stripe, Adyen, Checkout.com or Worldpay ([How Card Payments Work](/books/payments/card-payments#the-parties)).
- **Presentment:** delivering a transaction for payment: a card's clearing record to the issuer, or a check to the paying bank.
- **Processor:** the company that runs the systems for an acquirer (front-end authorizations, back-end clearing and settlement) or an issuer ([Inside a Processor](/books/payments/inside-a-processor)).
- **PSP (payment service provider):** a company that puts a gateway, processing and usually acquiring or payment facilitation behind one API; what this volume calls a payment provider ([The Payments Landscape](/books/payments/payments-landscape#gateways-and-payment-service-providers)).
- **PTS (PIN Transaction Security):** PCI's approval program for PIN entry devices, which a terminal needs to take PINs ([Card-Present Payments](/books/payments/card-present#terminals-and-where-the-pos-sits)).
- **RDC (remote deposit capture):** depositing checks by scanning them ([Accepting Checks](/books/payments/checks#remote-deposit-capture)).
- **Regulated debit:** US debit from issuers with $10 billion or more in assets, whose interchange is capped by Regulation II (the Durbin Amendment) ([Interchange & Pricing](/books/payments/interchange-and-pricing#regulated-debit)).
- **Remotely created check (demand draft):** a check created by the payee from the payer's account number, with no signature ([Accepting Checks](/books/payments/checks#check-fraud)).
- **Settlement:** the network netting issuers' and acquirers' positions and moving money between them.
- **SEPA, Bacs, Faster Payments, Pix, UPI:** the euro area's, the UK's (batch and instant), Brazil's and India's bank payment schemes ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull)).
- **Soft and hard decline:** a decline that may succeed later or with authentication, and one that never will for that card.
- **STAN, RRN:** the trace numbers that identify an ISO 8583 message for reversals and lookups.
- **Statement descriptor:** what the cardholder sees on their statement.
- **Void:** cancelling an authorization before capture, which releases the hold; an authorization reversal.
- **VRP (variable recurring payments):** UK open-banking mandates letting a provider pull from a customer's account within agreed limits ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull)).
- **Wero, iDEAL:** the European Payments Initiative's account-to-account wallet, and the Dutch bank payment method migrating onto it ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#wallets-that-are-rails)).

## The Rules

- **1033 (personal financial data rights):** the CFPB rule giving consumers the right to share bank data with third parties, enjoined and under reconsideration as of October 2026 ([The Payments Rulebook](/books/payments/payments-rulebook#the-consumer-protection-layer)).
- **AML, BSA, KYC, KYB:** anti-money-laundering programs, the Bank Secrecy Act that requires them, and knowing your customers and their businesses ([Merchant Onboarding](/books/payments/merchant-onboarding)).
- **APP scam reimbursement:** the UK's mandatory reimbursement of authorized push payment scam victims on Faster Payments and CHAPS since 7 October 2024, up to £85,000 per claim, with the receiving provider paying half ([Payments in the EU & UK](/books/payments/eu-and-uk#app-scam-reimbursement)).
- **Bacs, SUN, AUDDIS:** the UK's batch scheme for Direct Debits and Direct Credits on a three-day cycle (input, processing, entry), the service user number a collector gets through a sponsor, and the electronic mandate setup replacing paper ([Payments in the EU & UK](/books/payments/eu-and-uk#uk-faster-payments-bacs-and-chaps)).
- **CHAPS:** the Bank of England's same-day, high-value sterling payment system, settled gross in its RTGS service ([Payments in the EU & UK](/books/payments/eu-and-uk#uk-faster-payments-bacs-and-chaps)).
- **Convenience fee, service fee:** a flat fee for paying through an optional channel, and a fee some public agencies may charge under their own rules; neither is a surcharge ([Surcharging & Fees](/books/payments/surcharging-and-fees#convenience-and-service-fees)).
- **CTR, SAR, Form 8300:** reports of large cash transactions, of suspicious activity, and of cash over $10,000 received by any business.
- **Direct Debit Guarantee:** the UK payer's right to advance notice of each collection and a full and immediate refund from their own bank if an error is made ([Payments in the EU & UK](/books/payments/eu-and-uk#uk-faster-payments-bacs-and-chaps)).
- **FinCEN:** the US Treasury bureau that enforces the Bank Secrecy Act ([The Payments Rulebook](/books/payments/payments-rulebook#the-financial-crime-layer)).
- **FINTRAC:** Canada's financial intelligence unit, which registers money services businesses ([Payments in Canada](/books/payments/canada#who-regulates-you)).
- **GLBA:** the Gramm-Leach-Bliley Act, the US privacy and safeguards law for financial institutions' customer data ([The Payments Rulebook](/books/payments/payments-rulebook#the-map)).
- **IFR (Interchange Fee Regulation):** the EU regulation capping consumer debit interchange at 0.2% and credit at 0.3% and requiring unblended pricing; the UK kept the caps for domestic payments ([Payments in the EU & UK](/books/payments/eu-and-uk#card-rules)).
- **Money transmission, MTMA:** holding or moving other people's money, licensed state by state, and the model law harmonizing those licenses ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#holding-other-people-s-money)).
- **MSB (money services business):** the BSA's (and Canada's) category for money transmitters, check cashers and similar businesses that must register ([The Payments Rulebook](/books/payments/payments-rulebook#the-financial-crime-layer)).
- **OFAC, SDN list:** the Treasury office that runs US sanctions, and its list of blocked persons.
- **PAD (pre-authorized debit), Rule H1:** Canada's direct debit, and the Payments Canada rule that governs it ([Payments in Canada](/books/payments/canada#pre-authorized-debits-rule-h1)).
- **Passporting:** an institution authorized in one EU member state serving the others on that authorization; the UK left the system at the end of 2020 ([Payments in the EU & UK](/books/payments/eu-and-uk#who-regulates-you)).
- **Payment institution, e-money institution (PI, EMI):** the two main licenses for non-bank payment firms in the EU and the UK, each with its own initial capital ([Payments in the EU & UK](/books/payments/eu-and-uk#who-regulates-you)).
- **Payment processor exemption:** FinCEN's exclusion from money transmitter status for a business that only facilitates payment for goods or services through a clearance and settlement system, under conditions ([The Payments Rulebook](/books/payments/payments-rulebook#the-financial-crime-layer)).
- **PIS, AIS:** payment initiation and account information services, the two regulated open banking services PSD2 created ([Payments in the EU & UK](/books/payments/eu-and-uk#open-banking)).
- **PSD2, PSD3, PSR:** the EU's current payment services directive, its successor directive and the directly applicable regulation that accompanies it ([The Payments Rulebook](/books/payments/payments-rulebook#outside-the-us)).
- **Regulation CC:** US funds availability and check collection rules ([Accepting Checks](/books/payments/checks#when-the-money-is-available)).
- **Regulation E, Regulation Z:** consumer rights for electronic fund transfers and for credit cards ([The Payments Rulebook](/books/payments/payments-rulebook#the-consumer-protection-layer)).
- **RPAA:** Canada's Retail Payment Activities Act, under which payment service providers register with and are supervised by the Bank of Canada ([Payments in Canada](/books/payments/canada#who-regulates-you)).
- **SCT, SCT Inst:** SEPA Credit Transfer, credited by the end of the next business day, and SEPA Instant, credited within 10 seconds at any hour and now required by the Instant Payments Regulation ([Payments in the EU & UK](/books/payments/eu-and-uk#sepa-credit-transfer-and-sepa-instant)).
- **SDD Core, SDD B2B:** SEPA Direct Debit's general scheme, refundable for 8 weeks (13 months if unauthorized), and its business-only scheme, under which an authorized debit can't be returned ([Payments in the EU & UK](/books/payments/eu-and-uk#sepa-direct-debit)).
- **Standard 005:** the Canadian EFT file format, Canada's counterpart of a Nacha file ([Payments in Canada](/books/payments/canada#eft-files-standard-005)).
- **Surcharge:** a fee added to a credit card payment to cover the cost of acceptance, capped and disclosed under network rules and state law ([Surcharging & Fees](/books/payments/surcharging-and-fees)).
- **UDAAP:** unfair, deceptive or abusive acts or practices, the CFPB's standard for disclosures and flows ([The Payments Rulebook](/books/payments/payments-rulebook#the-map)).

## Taking Payments

- **3-D Secure (3DS):** the protocol by which an issuer authenticates a cardholder online ([SCA & 3-D Secure](/books/payments/strong-customer-authentication)).
- **3RI (3DS Requestor Initiated):** a 3-D Secure authentication the merchant starts without the customer present, to refresh or extend an earlier one ([SCA & 3-D Secure](/books/payments/strong-customer-authentication#3ri-authenticating-without-the-customer)).
- **A2P 10DLC:** carrier registration for business texting from ordinary 10-digit numbers ([Phone Payments](/books/payments/phone-payments#the-rules-for-texting)).
- **Account updater:** a network service that refreshes stored card numbers and expiries when cards are reissued ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#keeping-the-card-alive)).
- **ACS, Directory Server, 3DS Server:** the issuer's authentication service, the network's routing service, and the merchant side's component in 3-D Secure.
- **AFA (additional factor of authentication):** India's requirement, set by the Reserve Bank of India, for a second factor on digital payments ([SCA & 3-D Secure](/books/payments/strong-customer-authentication#beyond-psd2)).
- **APP fraud:** authorized push payment fraud, where a payer is tricked into sending money themselves ([Fraud & Risk](/books/payments/fraud-and-risk#bank-rail-fraud)).
- **Application:** a request to become a merchant, with its own states and history, separate from the merchant account it creates ([Merchant Onboarding](/books/payments/merchant-onboarding#the-application-is-not-the-merchant)).
- **Attempt:** one try at a processor for a payment, with its own raw response; a payment can have several ([How Card Payments Work](/books/payments/card-payments#the-core-data-model)).
- **Beneficial owner:** an individual who owns 25% or more of a business, or the one person who controls it, identified under FinCEN's customer due diligence rule ([Merchant Onboarding](/books/payments/merchant-onboarding#know-who-you-re-paying)).
- **Business email compromise:** fraud that redirects a payment by impersonating a vendor or executive ([Vendor Payouts](/books/payments/vendor-payouts#stopping-the-changed-bank-account)).
- **Card testing:** scripted attempts to check stolen card numbers with small payments ([Fraud & Risk](/books/payments/fraud-and-risk#card-testing)).
- **CAVV:** the authentication value from 3-D Secure, carried into the authorization as proof.
- **Chargeback (dispute):** the issuer taking money back from the merchant on the cardholder's behalf ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).
- **CIP (Customer Identification Program):** the US rule setting the minimum identity data a bank collects and verifies, by documents or non-documentary checks ([Merchant Onboarding](/books/payments/merchant-onboarding#know-who-you-re-paying)).
- **CIT, MIT:** customer-initiated and merchant-initiated transactions; a saved card charged later is an MIT ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#who-started-the-payment)).
- **Client secret:** a value that lets one browser session confirm one payment, never stored or logged ([Designing the Payments API](/books/payments/payments-api#keys-and-the-client)).
- **Compelling Evidence 3.0, RDR, Order Insight, Ethoca:** network services that prevent or resolve disputes before they count against the merchant ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#prevention-beats-winning)).
- **Consortium data:** fraud signals pooled across many merchants or institutions, such as a provider's view of one card across its whole network ([Fraud & Risk](/books/payments/fraud-and-risk#what-the-networks-know)).
- **Cryptogram:** a one-time value proving a token or chip card was used for this transaction.
- **Delegated authentication:** a merchant, wallet or provider authenticating the cardholder under an issuer's delegation instead of the issuer doing it ([SCA & 3-D Secure](/books/payments/strong-customer-authentication#who-performs-the-authentication)).
- **DTMF masking:** hiding the tones a caller keys on their phone so card digits never reach the agent or the recording ([Phone Payments](/books/payments/phone-payments#keep-the-digits-away-from-people)).
- **Dunning:** the sequence of retries and customer messages after a recurring payment fails ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#dunning)).
- **ECM, HECM, EFM:** Mastercard's Excessive Chargeback Merchant, High Excessive Chargeback Merchant and Excessive Fraud Merchant programs ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#monitoring-programs-the-threshold-that-ends-accounts)).
- **EDD, PEP:** enhanced due diligence for higher-risk customers, and a politically exposed person, one of the triggers for it ([Merchant Onboarding](/books/payments/merchant-onboarding#know-who-you-re-paying)).
- **Exposure:** the money a provider could lose if a merchant stopped paying: refunds, disputes and undelivered orders still able to come back ([Merchant Onboarding](/books/payments/merchant-onboarding#exposure-and-reserves)).
- **Friendly fraud:** a cardholder disputing a charge they made.
- **Frictionless, challenge:** a 3-D Secure authentication the cardholder never sees, and one where they're asked to prove who they are.
- **IVR (interactive voice response):** the automated phone menu that can take a payment without an agent ([Phone Payments](/books/payments/phone-payments#designing-the-ivr)).
- **Liability shift:** moving fraud loss from merchant to issuer, by chip in person or by 3-D Secure online.
- **MATCH:** Mastercard's list of merchants terminated for cause ([Inside a Processor](/books/payments/inside-a-processor#setting-up-a-merchant)).
- **MOTO:** mail order and telephone order, a card-not-present payment taken by phone or mail ([Phone Payments](/books/payments/phone-payments)).
- **Network risk score:** a fraud score the network adds to an authorization for the issuer, such as Visa Advanced Authorization and Mastercard Decision Intelligence ([Fraud & Risk](/books/payments/fraud-and-risk#what-the-networks-know)).
- **Network token:** a network-issued substitute for a PAN, scoped to a merchant or device and updated when the card changes ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#keeping-the-card-alive)).
- **Network transaction ID:** the identifier from a card's first stored-credential transaction, referenced by every later one ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#the-first-transaction-carries-the-rest)).
- **Payment intent:** an object that lives across a whole payment and its steps, such as 3-D Secure; this volume's `payments` row ([Designing the Payments API](/books/payments/payments-api#the-objects)).
- **Publishable, restricted and secret keys:** a key safe to put in a browser, a scoped server key, and an unrestricted server key.
- **Representment:** the merchant's evidence-backed response to a chargeback.
- **SCA (Strong Customer Authentication):** the European requirement for two-factor authentication on most online payments ([SCA & 3-D Secure](/books/payments/strong-customer-authentication#what-sca-requires)).
- **TC40, SAFE:** Visa's and Mastercard's issuer fraud reports, which count toward network ratios even without a dispute ([Fraud & Risk](/books/payments/fraud-and-risk#what-the-networks-know)).
- **Test clock:** simulated time in a test environment, to run subscriptions and disputes forward.
- **Thin event:** an event that carries only the type and the object's ID, so the receiver fetches the current object.
- **Transaction laundering:** a merchant processing payments for a business it doesn't disclose ([Fraud & Risk](/books/payments/fraud-and-risk#merchant-fraud)).
- **Trusted beneficiary:** a merchant a cardholder has added to a list held by their issuer, so the issuer can exempt later payments to it from SCA ([SCA & 3-D Secure](/books/payments/strong-customer-authentication#who-performs-the-authentication)).
- **UMR, creditor identifier:** a SEPA mandate's unique mandate reference and the payee's scheme identifier, carried on every collection ([Payments in the EU & UK](/books/payments/eu-and-uk#sepa-direct-debit)).
- **Unblending:** pricing each card brand and category separately rather than as one rate, which the IFR requires acquirers to offer ([Payments in the EU & UK](/books/payments/eu-and-uk#card-rules)).
- **VAMP:** Visa's acquirer monitoring program, combining fraud reports and disputes into one ratio ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#monitoring-programs-the-threshold-that-ends-accounts)).
- **Visa decline categories, merchant advice codes:** Visa's grouping of declines by whether a retry may succeed, and Mastercard's codes telling the merchant whether and when to retry ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#declines-and-the-rules-on-retrying)).

## Paying Out

- **1099-K, 1099-NEC:** US tax forms reporting payments settled to a merchant, and payments to a contractor or vendor for services ([Payments for Software Platforms](/books/payments/software-platforms#1099-k-and-taxpayer-data), [Vendor Payouts](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s)).
- **Backup withholding, B-notice:** 24% withheld from payments to a payee without a correct TIN, and the IRS notice that starts it.
- **BAI2, MT940, camt.052, camt.053, camt.054:** bank reporting formats: BAI2 in the US, MT940 elsewhere, and ISO 20022's intraday report, prior-day statement and individual debit and credit notifications ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#three-sources-of-truth), [Treasury & Bank Operations](/books/payments/treasury#bank-files)).
- **Banking day, calendar day:** windows in the rules are counted in one or the other, and they're different types ([Treasury & Bank Operations](/books/payments/treasury#the-banking-calendar)).
- **Break, break age:** anything the matching engine couldn't match, or matched with a difference, kept as a record with a type, an owner and a deadline; its age is the control ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#breaks)).
- **Clawback:** recovering funds from a merchant after payout, usually by ACH debit ([Payouts & Settlement](/books/payments/payouts-and-settlement#clawbacks)).
- **Confirmation of Payee, Verification of Payee (CoP, VoP):** the UK's and the EU's checks that the payee's name matches the account before a transfer is sent ([Payments in the EU & UK](/books/payments/eu-and-uk#confirmation-of-payee), [Fraud & Risk](/books/payments/fraud-and-risk#bank-rail-fraud)).
- **Escheatment:** turning unclaimed money over to the state after a dormancy period.
- **Expected record:** a record created before money moves, so an arriving deposit is matched to what was expected rather than identified from scratch ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#a-matching-engine)).
- **External record:** one row of a processor file or bank statement in a canonical shape, with the raw row it came from ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#one-importer-per-source)).
- **Fast Funds:** Visa's program requiring issuers to make pushed card payments available within 30 minutes ([Vendor Payouts](/books/payments/vendor-payouts#push-to-card)).
- **FBO account (for-benefit-of):** a bank account in the provider's name holding money for its merchants ([Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).
- **Gross and net settlement:** paying merchants the full amount and collecting fees separately, or deducting fees from each payout; the same words describe how an acquirer settles to the provider ([Treasury & Bank Operations](/books/payments/treasury#funding-the-day)).
- **Nacha:** the association that writes the ACH rules; a Nacha file is the 94-character format entries travel in ([ACH & Bank Transfers](/books/payments/ach#anatomy-of-a-nacha-file)).
- **Negative balance:** a merchant owing the platform more than its balance holds ([Payouts & Settlement](/books/payments/payouts-and-settlement#negative-balances)).
- **NOC (notification of change):** an RDFI's correction to outdated account details, posted instead of a return.
- **OCT, AFT:** a card network original credit transaction (pushing money to a card) and an account funding transaction (pulling money from one to fund something else) ([Vendor Payouts](/books/payments/vendor-payouts#push-to-card)).
- **ODFI, RDFI:** the originator's bank, which sends entries, and the receiver's bank.
- **Originator, Receiver:** the business that starts an ACH entry, and the account holder it credits or debits.
- **Pass-through insurance:** FDIC coverage that reaches each owner of a pooled custodial account, if the records allow it.
- **Payout:** money leaving a merchant's balance for their bank account ([Payouts & Settlement](/books/payments/payouts-and-settlement)).
- **Pending, available balance:** money captured but not yet settled, and money past its availability date that can be paid out ([Payouts & Settlement](/books/payments/payouts-and-settlement)).
- **Per-owner balance file:** the daily file of each owner's balance in a custodial account, summing to the account's closing balance to the cent ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#proving-it-to-auditors-and-sponsor-banks)).
- **Positive pay:** a file of issued checks the bank uses to reject altered or counterfeit ones.
- **Prefunding, sweep:** moving money into an account ahead of payouts, and moving earned fees out of a custodial account.
- **Prenote, micro-entries:** a zero-dollar test entry, and small credits used to verify an account ([ACH & Bank Transfers](/books/payments/ach#validating-the-account)).
- **Reserve:** merchant funds held back against future disputes and refunds: a dated hold, a rolling reserve or a fixed reserve ([Payouts & Settlement](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)).
- **Return, R-code:** an RDFI rejecting an entry, with a reason code such as R01 (insufficient funds) or R10 (unauthorized) ([ACH & Bank Transfers](/books/payments/ach#returns-when-money-is-really-yours)).
- **Reversal:** three different things. On cards, an authorization reversal (a void, ISO 8583 `0400`) that releases a hold; on ACH, an originator undoing its own erroneous entry within five banking days ([ACH & Bank Transfers](/books/payments/ach#reversals)); in some provider APIs, such as Adyen's, a request that cancels or refunds, whichever applies.
- **Roll-forward:** the check that opening balance plus the day's entries equals the closing balance, and the closing balance equals the bank's ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#closing-the-day-and-the-month)).
- **Safeguarding:** the UK and EU regime protecting customer funds held by payment and e-money institutions, with daily reconciliation in the UK ([Treasury & Bank Operations](/books/payments/treasury#safeguarding-outside-the-us), [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#proving-it-to-auditors-and-sponsor-banks)).
- **Same Day ACH:** ACH entries settled the day they're sent.
- **SEC code:** the code on an ACH batch stating how the payment was authorized: PPD, WEB, TEL, CCD, CTX, and the check conversion codes ARC, BOC, POP and RCK ([ACH & Bank Transfers](/books/payments/ach#files-batches-and-sec-codes)).
- **Standing virtual card:** a multi-use card number issued to one vendor with its own limits, as opposed to a single-use card per invoice ([Vendor Payouts](/books/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate)).
- **Suspense account:** a liability holding money that has arrived and isn't yet identified, never a plug for a difference ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#suspense-accounts-and-who-works-breaks)).
- **Three-way match:** ledger to processor files per transaction, processor to bank per batch, and the ledger's cash to the bank's balances daily ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#three-sources-of-truth)).
- **T+N:** a schedule where money captured on day T is available N business days later.
- **Third-Party Sender:** a company that originates ACH for others through its own bank relationship.
- **TIN matching, W-9:** checking a payee's name and taxpayer ID against the IRS, and the form on which a US payee provides them ([Vendor Payouts](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s)).
- **Unapplied cash:** money received from a customer and not yet matched to a charge ([Payment States & Ledgers](/docs/payments/payment-states#payments-are-applied-not-assigned)).
- **Virtual card:** a card number issued for one payable, with controls on amount, dates and merchant ([Vendor Payouts](/books/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate)).

## Running a Provider

- **ACP (Agentic Commerce Protocol):** the open specification, maintained by OpenAI and Stripe, for how an agent and a seller exchange carts and orders ([AI in Payments](/books/payments/ai-in-payments#agentic-commerce)).
- **Adverse action notice:** the notice Regulation B requires within 30 days for a denied credit application, stating specific principal reasons ([AI in Payments](/books/payments/ai-in-payments#model-risk-fair-lending-and-udaap)).
- **Agentic commerce:** AI agents that search, choose and pay on a consumer's behalf ([AI in Payments](/books/payments/ai-in-payments#agentic-commerce)).
- **Agentic token, shared payment token:** a network token issued for a registered agent (Visa Intelligent Commerce, Mastercard Agent Pay), and Stripe's seller-scoped, limited, revocable token passed under ACP ([AI in Payments](/books/payments/ai-in-payments#agentic-commerce)).
- **Agent mandate:** a scoped, expiring, revocable permission from a user for an agent to pay, checked in code before each payment ([AI in Payments](/books/payments/ai-in-payments#what-an-agent-may-initiate)).
- **AOC, ROC, SAQ:** PCI's attestation of compliance, report on compliance, and self-assessment questionnaire ([PCI DSS](/docs/compliance/pci-dss)).
- **AP2 (Agent Payments Protocol):** Google's protocol, donated to the FIDO Alliance, that records what a user authorized as signed mandates ([AI in Payments](/books/payments/ai-in-payments#agentic-commerce)).
- **ASV, QSA:** an approved scanning vendor and a qualified security assessor.
- **Authorization rate, payment success rate:** issuer approvals over attempts sent to the network, and authorized attempts over all valid attempts, including authentication failures and risk blocks ([Payments Metrics](/books/payments/payments-metrics#acceptance)).
- **Capture token, stored token:** the short-lived token a browser gets, and the long-lived one the platform saves in exchange ([Running a Card Vault](/books/payments/card-vault#designing-the-token)).
- **Card fingerprint:** a keyed hash of a card number that recognizes the same card behind different tokens.
- **Cascading:** sending a declined or failed payment to another processor, within the networks' retry rules ([Processor Routing](/books/payments/processor-routing#cascading-and-smart-retries)).
- **CDE (cardholder data environment):** every system that stores, processes or transmits card data, plus whatever can reach them.
- **Charging processor:** the processor that holds a stored credential and charges it, switched cohort by cohort during a migration ([Switching Processors](/books/payments/switching-processors#how-to-build-it)).
- **Cryptoperiod:** how long a key may be used before it's replaced ([HSMs & Key Management](/books/payments/key-management#cryptoperiods-and-rotation)).
- **Degraded mode:** a decision made in advance about what keeps working, what queues and what stops when a processor, network or bank is down ([Operating the Platform](/books/payments/operating-the-platform#when-a-processor-network-or-bank-is-down)).
- **DUKPT, BDK:** the scheme that gives every terminal transaction its own key, and the root key it derives them from ([HSMs & Key Management](/books/payments/key-management#dukpt-and-pin-blocks)).
- **EMV Levels 1, 2 and 3:** terminal certification of the hardware, the kernel, and the integration end to end; unrelated to Level 2 and Level 3 data ([Network Certification](/books/payments/network-certification#card-present-emv-levels-1-2-and-3)).
- **Envelope encryption:** data encrypted under a data key, which is itself encrypted under a key-encrypting key in a KMS or HSM ([Encryption at Rest](/docs/security/encryption-at-rest#envelope-encryption)).
- **Forwarder:** the vault component that swaps a token for the card number on the way to a processor, the only path a number takes out.
- **HSM, KMS:** a hardware security module, and a key management service, often built on HSMs.
- **ISV (independent software vendor):** a software company, often vertical, that embeds payments in its product ([Payments for Software Platforms](/books/payments/software-platforms)).
- **Key block (TR-31), KCV:** a key wrapped with its permitted uses, and a key check value used to confirm a key without revealing it.
- **Location:** a physical site under a merchant, such as a store or clinic, with its own terminals and sometimes its own merchant account ([Payments for Software Platforms](/books/payments/software-platforms#the-hierarchy)).
- **Managed payfac (payfac-as-a-service):** a platform that runs payments under a provider's payment facilitator registration, with the provider holding the network relationship ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#pick-a-model-pick-a-risk), [The Payments Landscape](/books/payments/payments-landscape#embedded-payments-how-the-platforms-do-it)).
- **Mapping file:** the file a receiving processor returns after an import, linking each old card reference to its new one ([Switching Processors](/books/payments/switching-processors#how-the-platforms-do-it)).
- **Merchant account:** the processing relationship a MID identifies; one business can hold several, for different MCCs or entities ([Payments for Software Platforms](/books/payments/software-platforms#one-merchant-several-merchant-accounts)).
- **MID warming:** ramping volume on a new merchant ID while issuers, which haven't seen it before, decline more of its payments ([Switching Processors](/books/payments/switching-processors#watching-declines-after-cutover)).
- **Model risk guidance (SR 26-2, OCC Bulletin 2026-13):** the US banking agencies' April 2026 model risk management guidance, superseding SR 11-7 and leaving generative and agentic AI out of scope ([AI in Payments](/books/payments/ai-in-payments#model-risk-fair-lending-and-udaap)).
- **PAN import, PAN export:** moving stored card numbers between processors in an encrypted processor-to-processor file, never through the merchant ([Switching Processors](/books/payments/switching-processors#moving-card-numbers)).
- **Pass-through margin:** for interchange-plus merchants, the markup kept once interchange and network fees pass through, with any gap between estimated and actual costs shown separately ([Payments Metrics](/books/payments/payments-metrics#revenue-and-cost)).
- **Payment facilitator (payfac):** a company that signs merchants as sub-merchants under its own master account, registered with the networks through a sponsor ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider)).
- **Payment orchestration:** a layer that routes payments across several processors through one API and vault ([Processor Routing](/books/payments/processor-routing#how-the-platforms-do-it), [The Payments Landscape](/books/payments/payments-landscape#orchestration-vaults-and-fraud)).
- **PCI DSS:** the card industry's security standard for anyone handling card data.
- **PFI (PCI Forensic Investigator):** the firm that investigates a card data compromise when a brand requires it ([Operating the Platform](/books/payments/operating-the-platform#when-card-data-is-exposed)).
- **PIN block:** a PIN encrypted together with the card number, in an ISO 9564 format (format 4 for AES).
- **P2PE:** point-to-point encryption of card data from the terminal to the decryption environment ([Card-Present Payments](/books/payments/card-present#p2pe-encrypt-at-the-glass)).
- **Raw and deduplicated rates:** an acceptance rate counting every attempt, and one counting each purchase's final outcome after retries ([Payments Metrics](/books/payments/payments-metrics#acceptance)).
- **Remote key loading (TR-34):** delivering a terminal's first keys with asymmetric cryptography instead of in a key injection facility.
- **Reserve coverage:** reserves held over estimated exposure, per merchant and for the portfolio ([Payments Metrics](/books/payments/payments-metrics#merchants)).
- **Residuals:** a revenue share a provider pays a platform or reseller after the fact.
- **Service provider:** in PCI terms, anyone who handles card data for other businesses; it brings extra requirements.
- **Sponsor bank:** the network member bank that lets a non-bank provider acquire or originate under its membership, and answers to the network for it ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#the-sponsor-bank)).
- **Stand-in processing (STIP):** the network approving or declining on an issuer's behalf when the issuer can't be reached or is too slow ([Inside a Processor](/books/payments/inside-a-processor#when-the-issuer-doesn-t-answer)).
- **Sub-merchant (sponsored merchant):** a merchant that processes under a payment facilitator's account; the platforms' connected account or account holder ([Payments for Software Platforms](/books/payments/software-platforms#the-hierarchy)).
- **Take rate:** net revenue over gross volume, in basis points, read with its mix ([Payments Metrics](/books/payments/payments-metrics#revenue-and-cost)).
- **Token requestor:** the party registered with a network to request and hold network tokens, identified by its token requestor ID (TRID), which decides who can use them elsewhere ([Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are), [Switching Processors](/books/payments/switching-processors#network-tokens-and-account-updater-after-the-move)).
- **Transaction link identifier:** Mastercard's identifier tying the messages that follow an authorization to it ([Inside a Processor](/books/payments/inside-a-processor)).
- **Trusted Agent Protocol:** Visa's protocol letting a merchant verify an agent by its cryptographic signature ([AI in Payments](/books/payments/ai-in-payments#agentic-commerce)).
- **VAMP enumeration ratio:** Visa's count of enumerated (card-testing) authorizations over all authorizations, approved and declined ([Payments Metrics](/books/payments/payments-metrics#fraud)).
- **Vault token:** a random stand-in for a card or bank number, meaningful only to the vault that issued it ([Running a Card Vault](/books/payments/card-vault)).
- **VisaNet, V.I.P.:** Visa's network, and the VisaNet Integrated Payment system that carries its authorizations ([Inside a Processor](/books/payments/inside-a-processor)).
- **ZMK, ZPK:** a zone master key shared once with a partner, and the working PIN key it protects on that link ([HSMs & Key Management](/books/payments/key-management#the-key-hierarchy)).

## References

**Reference**

- [Nacha: How ACH Works](https://achdevguide.nacha.org/how-ach-works), the ACH parties and SEC codes
- [PCI SSC: Document library](https://www.pcisecuritystandards.org/document_library/), PCI DSS and its glossary of terms
- [EMVCo: EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/), the 3-D Secure specification and its components
