+++
title = "Stablecoins & Crypto Rails"
nav_title = "Stablecoins"
description = "Payment stablecoins for a provider: issuers and reserves, the GENIUS Act and MiCA, network settlement, pay-ins, payouts, screening, finality and the ledger."
category = "Payments Industry"
order = 1409
part = "How Money Moves"
tags = ["payments", "stablecoins", "crypto", "settlement", "compliance", "aml"]
+++

A payment stablecoin is a dollar (or euro) that lives on a blockchain: a token an issuer promises to redeem at a fixed value, backed by reserves the issuer holds in bank deposits and short Treasuries. It moves the way a token moves, by a signed transfer on a public ledger that anyone can read, at any hour, with no bank in the path and no way to pull it back. That makes it a rail with a different set of answers from every other rail in this volume: it starts like a push payment, it's final in seconds or minutes, it settles on weekends, and it has no chargebacks, no return codes and no account holder's bank to ask.

For a provider, stablecoins arrive in three ways. The card networks settle with some of their banks in stablecoins, which changes treasury but not the merchant's checkout. Providers accept stablecoins from payers and settle merchants in dollars, which adds a payment method with its own failure modes. And platforms pay contractors and sellers abroad in stablecoins, which turns a slow cross-border payout into a fast one with new compliance work. This chapter covers what a payment stablecoin is and how it moves, the law in the US, EU and UK as of October 2026, what the networks and providers actually ship, what it takes to add stablecoins to a provider, and when not to. The cross-border context is in [Cross-Border Payments & FX](/books/payments/cross-border-and-fx), and the side-by-side with every other rail in [Comparing the Rails](/books/payments/comparing-the-rails).

## What a Payment Stablecoin Is

The GENIUS Act defines a payment stablecoin as a digital asset that "is, or is designed to be, used as a means of payment or settlement," whose issuer is "obligated to convert, redeem, or repurchase for a fixed amount of monetary value," and which it represents will hold a stable value. Four parts make one work:

- **The issuer.** A regulated company (Circle for USDC, Paxos for PayPal's PYUSD) that creates tokens when it receives dollars and destroys them when it pays dollars back. The holder's claim is against the issuer, not the blockchain.
- **The reserves.** The assets backing every token outstanding, one to one. Circle, for example, holds most of USDC's reserves in an SEC-registered government money market fund managed by BlackRock and the rest in cash at large banks, discloses the holdings weekly, and publishes monthly assurance reports from a Big Four accounting firm.
- **Mint and redeem.** Only the issuer's direct customers (exchanges, payment companies, banks, after onboarding) mint and redeem with it. Everyone else buys and sells on the secondary market, through an exchange or a **ramp**: an on-ramp turns bank money into tokens, an off-ramp turns tokens into bank money.
- **The token contract on each chain.** USDC exists as a separate contract on dozens of blockchains (Circle lists Ethereum, Solana, Base, Polygon PoS, Arbitrum, Avalanche, Stellar and many more), each with its own address. USDC on Solana and USDC on Ethereum are both redeemable at Circle, but they are different tokens on different ledgers, and moving between them is a transfer service of its own. A **bridged** token is different again: Circle says the bridged `USDC.e` on X Layer "is not issued or backed by Circle."

Amounts have their own precision. USDC uses six decimal places, so one USDC is 1,000,000 base units on chain; other tokens use 18. A provider's [money model](/docs/payments/money#exponents-come-from-a-table) takes the exponent from a table per asset, never from the currency code.

## How It Moves

A stablecoin transfer is an instruction, signed with the sender's private key, to the token contract: move this many units from my address to that one. The chain's validators include it in a block, and from then on every node agrees on the new balances.

- **Wallets hold keys, not money.** The balance lives on chain; a wallet is software that holds the private key for an address. In a **self-custody** (unhosted) wallet the payer holds the key. In a **custodial** (hosted) wallet an exchange or provider holds it and keeps its own ledger of who owns what, exactly like an FBO account ([FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).
- **Addresses are the account numbers,** and they're public. Anyone can see every transfer into and out of an address, which is what makes blockchain analytics possible, and also why a provider gives each payment its own deposit address instead of publishing one.
- **Fees are paid in the chain's own coin.** On Ethereum, "gas fees have to be paid in Ethereum's native currency, ether (ETH)," and the fee "is paid regardless of whether a transaction succeeds or fails." A wallet holding only USDC can't send it; it also needs ETH (or SOL, or whatever the chain uses).
- **Final means the chain won't reorganize.** A transaction in a block can still be dropped if the chain reorganizes before that block is finalized. Circle's cross-chain transfer service waits for what it calls hard finality, "when the transaction is unlikely to be reversed by a chain reorganization," and publishes how long that takes: 32 blocks or about 17 seconds on Solana, one block or about 8 seconds on Avalanche, about 5 seconds on Stellar, 2 to 3 blocks or about 8 seconds on Polygon PoS, and about 65 Ethereum blocks or 15 to 19 minutes on Ethereum and on the rollups that settle to it (Arbitrum, Base).

### Finality Next to Cards and ACH

Set against the rows in [Comparing the Rails](/books/payments/comparing-the-rails#the-questions-every-rail-answers):

| Rail | Who starts it | You know it worked | Final | Comes back as |
| --- | --- | --- | --- | --- |
| **Stablecoin transfer** | The payer, pushing from a wallet | Seconds, when it's in a block | At chain finality: seconds on some chains, 15 to 19 minutes on Ethereum | Nothing; a refund is a new transfer. The issuer can freeze or burn under a lawful order |
| **Card, online** | The merchant, with the cardholder's details | Seconds, at authorization | After the dispute window, typically 120 days | A chargeback |
| **ACH debit** | The originator | When no return arrives | 60 days for a consumer's unauthorized claim | A return |
| **Wire, RTP, FedNow** | The payer, pushing | Seconds to hours | Immediately | Nothing |

A stablecoin pay-in behaves like an instant push payment that never closes for the weekend: finality comes fast and is real, so the risk that dominates card payments (money you've released coming back) mostly disappears. What replaces it is the risk on the other end, that the money came from somewhere it shouldn't have, and that a mistake in the address or chain can't be fixed by anyone.

![A stablecoin pay-in as six stages left to right. The payer's wallet, self-custody or an exchange, sends a transfer on a blockchain, in a block and then final. The transfer reaches the provider's deposit address, accented, where it is screened and matched to the payment; the arrow into it carries balloon 1. From there an off-ramp, run by a ramp or the issuer, takes stablecoin in and sends dollars out; balloon 2 sits on the arrow from the off-ramp to the provider's settlement account, an FBO account where the ledger posts; balloon 3 sits on the arrow from settlement to the merchant's bank account, an ACH or wire payout. A table of finality points below: 1, final on chain, typically seconds to about 19 minutes by chain, after which a reorg can no longer undo it (accented); 2, dollars at the provider, same day to a few business days, after the ramp's wire or ACH has settled; 3, payout settled, next banking day or same day, after which an ACH credit can still come back.](/diagrams/pm-stablecoin-pay-in.svg "A stablecoin pay-in passes three finality points. The provider credits the payment at the first, chain finality; the merchant's dollars depend on the ramp and the bank rail after it, which run on banking days.")

## The Law in the United States

### The GENIUS Act

The Guiding and Establishing National Innovation for U.S. Stablecoins (GENIUS) Act was signed on July 18, 2025. What it requires, from the enrolled text:

- **Only permitted issuers may issue.** "It shall be unlawful for any person other than a permitted payment stablecoin issuer to issue a payment stablecoin." Permitted issuers are subsidiaries of insured depository institutions, federally qualified nonbank issuers supervised by the OCC, and state-qualified issuers under a state regime certified as substantially similar, an option open to issuers with $10 billion or less outstanding. Crypto and payments firms, Circle among them, have also entered the federal system through OCC national trust charters, covered in the Banking & Lending volume's [Trust Banks and Novel Charters](/books/banking-and-lending/charters-and-regulators#trust-banks-and-novel-charters).
- **Reserves one to one, in a short list of assets:** coins and currency, demand deposits, Treasuries with 93 days or less to maturity, repo and reverse repo backed by Treasuries, and other similarly liquid government assets the regulator approves.
- **Disclosure.** Issuers publish their redemption policy, disclose "in plain language all fees associated with purchasing or redeeming" with at least seven days' notice of changes, and publish the composition of their reserves monthly. The monthly report is examined by a registered public accounting firm, and the CEO and CFO certify it. An issuer with more than $50 billion outstanding also publishes annual audited financial statements.
- **No interest.** No issuer "shall pay the holder of any payment stablecoin any form of interest or yield."
- **AML and sanctions.** An issuer "shall be treated as a financial institution for purposes of the Bank Secrecy Act," and may issue only if it has "the technological capability to comply" with lawful orders to "seize, freeze, burn, or prevent the transfer" of its tokens.
- **Holders come first in insolvency,** with priority over other claims against the required reserves.
- **Not securities or commodities,** when issued by a permitted issuer.
- **Distribution narrows later.** From three years after enactment (July 18, 2028), a digital asset service provider may not "offer or sell a payment stablecoin" in the US unless a permitted issuer issued it (or a foreign issuer in a comparable regime). A provider's list of supported tokens is a compliance decision, not just a product one.

**When it takes effect.** Section 20 makes the Act effective on the earlier of 18 months after enactment or 120 days after the regulators issue final rules. No final rule landed by September 20, 2026, the last date that could have pulled it earlier, so the date is **January 18, 2027**; the OCC's final rule says so too.

### Rulemaking, as of October 2026

Section 13 gave the regulators one year to write rules; they missed it. Where each stands:

| Agency | Rule | Status |
| --- | --- | --- |
| **OCC** | Requirements for issuers under its jurisdiction, including subsidiaries of national banks and federal qualified issuers, and custody by OCC-supervised entities | Final, issued October 21, 2026 and published October 23; effective January 18, 2027. Keeps two-business-day redemption, with notice to the OCC within 24 hours when redemption requests exceed 10% of outstanding issuance in a day |
| **FDIC** | Applications by FDIC-supervised banks to issue through a subsidiary, and requirements for those issuers | Proposed; the applications comment period was extended to May 18, 2026, and the requirements proposal was published April 10, 2026. No final rule found |
| **Federal Reserve** | Applications by state member banks, and requirements for issuers it supervises | Proposed September 24, 2026; comments due November 30, 2026 |
| **Treasury** | Broad-based principles for when a state regime is substantially similar | Proposed April 3, 2026 |
| **Treasury (for the Stablecoin Certification Review Committee)** | Procedures for certifying state regimes | Interim final rule, effective September 30, 2026; a state's initial certification is due by January 18, 2028 |
| **FinCEN and OFAC** | AML and sanctions compliance programs for issuers | Proposed April 8, 2026; comments closed June 9, 2026 |

Most of this binds issuers, not the providers that move their tokens. What reaches a provider is the asset list (only permitted issuers' tokens after July 2028), the issuer's freeze capability (a token in your custody can be frozen), and the BSA program expectations that issuers will push down to the ramps and platforms they serve.

### State Regimes and New York

Before the Act, the states regulated stablecoins, and New York's Department of Financial Services set the template. Its June 8, 2022 guidance for dollar-backed stablecoins issued under its supervision requires redemption at par within two full business days, reserves segregated and limited to short Treasuries, Treasury-backed overnight repo, government money market funds and bank deposits, a monthly examination of management's assertions about the reserves by an independent CPA, published, and an annual CPA report on internal controls. The GENIUS Act's state option lets a regime like New York's continue for issuers under $10 billion once it's certified.

### Money Transmission for Custodial Wallets

A provider that holds stablecoins for merchants or payers is holding other people's money, and the analysis in [Holding Other People's Money](/books/payments/becoming-a-payment-provider#holding-other-people-s-money) applies. FinCEN's 2019 guidance says a person accepting and transmitting convertible virtual currency is a money transmitter that must register as a money services business and run an AML program; a hosted wallet provider's duties follow its position in the chain, while a self-hosted wallet's owner using it for their own purposes is not a transmitter. States license it on top, New York with its own virtual currency license (23 NYCRR Part 200). The same structuring questions apply as for fiat, and the answer depends on whether your ramp or a custodian, rather than you, holds the tokens, which is why the custody model below comes before the ledger.

## The EU and the UK

**EU: MiCA e-money tokens.** The Markets in Crypto-Assets Regulation (Regulation (EU) 2023/1114) calls a single-currency stablecoin an **e-money token** (EMT), and its stablecoin titles (III and IV) applied from June 30, 2024, six months before the rest of the regulation. An EMT may be offered to the public only by its issuer, authorized as a credit institution or an electronic money institution, and EMTs "shall be deemed to be electronic money." The holder has a claim on the issuer, which must redeem "at any time and at par value," in funds other than e-money, without a fee. Neither the issuer nor a crypto-asset service provider (CASP) may grant interest, and MiCA counts "any remuneration or any other benefit related to the length of time" a holder keeps the token as interest. Circle announced on July 1, 2024 that its French entity, licensed as an e-money institution by the ACPR, was issuing USDC and EURC under MiCA.

For a provider in the EU, three things follow. **Only MiCA-compliant EMTs** can be offered to the public, so the asset list is again a legal decision. **Custody and transfer of tokens for clients is a CASP service,** and the transitional periods that let unauthorized firms keep operating ended on July 1, 2026; ESMA expects unauthorized firms to wind down. And the **travel rule has no threshold for crypto**: the Transfer of Funds Regulation (Regulation (EU) 2023/1113) extends originator and beneficiary information to crypto-asset transfers involving a CASP, applying from December 30, 2024, with the EBA's guidelines on what to send and what to do when it's missing. How EU payment licensing works in general is in [Who Regulates You](/books/payments/eu-and-uk#who-regulates-you).

**UK.** The Financial Services and Markets Act 2000 (Cryptoassets) Regulations 2026 passed on February 4, 2026, and the FCA published its final rules on June 30, 2026, with PS26/10 covering stablecoin issuance: backing assets held on statutory trust for holders, per product, and redemption by the end of the business day after the issuer receives the tokens. Firms apply from September 30, 2026 to February 28, 2027, and the regime starts on **October 25, 2027**, when issuing qualifying stablecoins and custody of cryptoassets become regulated activities. Sterling stablecoins used at systemic scale go to the Bank of England, which published its policy statement in June 2026 and a joint approach with the FCA on June 30. As of October 2026, then, a UK provider is preparing for a regime, not operating under one.

## How the Platforms Do It

Most of what the networks call stablecoin settlement doesn't touch the merchant: the cardholder pays by card, the merchant is paid in dollars, and stablecoins move between the network and its banks. What each documents publicly, as of October 2026:

| Company | What it does with stablecoins | Tokens and chains | Merchant receives |
| --- | --- | --- | --- |
| **Checkout.com** | Stablecoin settlement for US enterprise merchants, with Fireblocks (June 3, 2026); not offered in New York, Virginia, Alaska or Puerto Rico | Not documented | Stablecoins, to a wallet it chooses |
| **Mastercard** | Issuers and acquirers can settle with the network in stablecoins (June 2026), alongside intraday and weekend settlement; first institutions include Cross River, Lead Bank and Nuvei. Completed its acquisition of BVNK, a stablecoin infrastructure company, on August 3, 2026 | USDC, PYUSD, USDG, USDP, RLUSD, SoFiUSD | Unchanged; network settlement |
| **PayPal** | Pay with Crypto: the payer pays from a crypto wallet, PayPal converts and credits the merchant; 1.5% of the transaction from August 1, 2026. PYUSD, issued by Paxos, can also hold part of a merchant's balance | PYUSD on Ethereum, Solana and Arbitrum | US dollars in the PayPal balance |
| **Shift4** | Opt-in stablecoin settlement instead of a bank transfer (December 22, 2025) | USDC, USDT, EURC, DAI on Ethereum, Solana, Plasma, Stellar, Polygon, TON, Base | Stablecoins, on the network it picks |
| **Stripe** | Stablecoin payments at checkout for US businesses (private preview in the EU, Hong Kong, Mexico and Switzerland); stablecoin balances in financial accounts; owns Bridge, whose virtual accounts turn bank deposits into stablecoins and whose liquidation addresses turn stablecoins into bank payments | USDC on Tempo, Ethereum, Solana, Polygon and Base; USDP and USDG in the US | Local currency in the Stripe balance |
| **Visa** | US issuers and acquirers can settle with Visa in USDC (December 2025, starting with Cross River Bank and Lead Bank, over Solana); by April 2026 a $7 billion annualized settlement run rate across nine chains and 130+ stablecoin-linked card programs in more than 50 countries | USDC and others on Arc, Avalanche, Base, Canton, Ethereum, Polygon, Solana, Stellar, Tempo | Unchanged; network settlement |
| **Worldpay** | Stablecoin payouts to recipients in more than 180 markets, with BVNK (announced May 27, 2025); the client doesn't hold stablecoins | Not documented | Payouts, not pay-ins |

Two patterns stand out. **The money behind the checkout moves first:** network settlement in stablecoins changes when an acquirer is funded (weekends included) without changing anything a merchant or cardholder sees. **Acceptance is sold as conversion:** PayPal and Stripe let a payer pay in tokens and settle the merchant in dollars, so the merchant never holds a token and the provider (or its ramp) carries the conversion. Adyen documents no stablecoin product as of October 2026. Infrastructure is consolidating into the large players: Stripe completed its acquisition of Bridge on February 4, 2025, the OCC conditionally approved Bridge for a national trust bank charter in February 2026, and in December 2025 it conditionally approved Circle's and Ripple's new national trust banks and the conversions of BitGo, Fidelity Digital Assets and Paxos, preliminary approvals that don't allow taking deposits. The dated sequence is in [Recent Moves](/books/payments/payments-landscape#recent-moves-as-of-october-2026).

### Ramps

Between the chain and the bank sits the ramp, and it's where a provider's stablecoin product is really built. Bridge's two primitives show the shape. A **virtual account** is a "permanent, reusable fiat deposit address" that converts incoming bank payments (US ACH or wire, SEPA, SPEI, Pix, Faster Payments, Bre-B) into tokens delivered to a wallet. A **liquidation address** is "a permanent payment route which ties a blockchain address to either a fiat or blockchain address": tokens sent to it come out as, for example, a USD wire to a bank account. A ramp is a counterparty like an FX provider ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx#fx-rates-providers-and-quotes)): you choose it for coverage, rates, cutoffs and its own licensing, and you reconcile against its statements.

## Adding Stablecoins to a Provider

### Pay-Ins Settled in Fiat

The common product: a payer pays in a stablecoin, the merchant is paid in dollars and never holds a token. The flow is in the diagram above, and the decisions are these:

- **Quote, then address.** The payment is in dollars; the payer sends tokens. Fix the token amount and the network when the payer chooses them, give that payment its own deposit address (or a payment reference the chain carries), and set an expiry. One address per payment makes matching a lookup rather than a guess.
- **Decide underpayment, overpayment and late payment up front.** Payers send from exchanges that deduct fees, send twice, or send after the quote expired. Each is a state: partially paid (ask for the rest or refund it), overpaid (refund the excess), expired (refund or requote). None of them is an exception queue nobody owns.
- **Credit at finality, not at sight.** A transfer seen in the mempool or in one block is "you know it worked" at best. Mark the payment `succeeded` when the transfer reaches the chain's finality, and record the block it was in.
- **Convert on your schedule, not the payer's.** The off-ramp runs on banking days; the chain doesn't. Holding tokens between finality and redemption is a balance the ledger has to carry (below), and the merchant's payout follows the fiat leg, not the chain.
- **Limits.** Stripe caps a customer's stablecoin payment at $10,000 per transaction. Whatever yours is, set it per payer and per merchant from the risk work in [Fraud & Risk](/books/payments/fraud-and-risk).

### Payouts to Contractors and Sellers Abroad

The other common product is the reverse: a platform pays people in countries where a bank payout is slow or expensive. Worldpay's version pays recipients in more than 180 markets without the client holding tokens; Stripe's financial accounts can send a stablecoin balance to a crypto wallet or pay it out as local currency to a bank account. A stablecoin payout is a disbursement like any other in [Vendor Payouts](/books/payments/vendor-payouts#rails-by-provider): it's final the moment it lands, so the controls in [Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account) apply to a changed wallet address with more force, since there's no bank to call. Verify a new address out of band, send a small test transfer first, hold the first payout, and screen the address before every send.

### Custody or Not

Who holds the keys decides the licensing, the security model and the ledger:

- **A ramp or custodian holds everything.** The provider never touches a token: the payer pays into the ramp's address, the ramp sends dollars. Least work and least licensing exposure, but the ramp is now in your critical path and your reconciliation has one more counterparty.
- **The provider holds keys** in its own wallets: hot wallets for daily flows and cold storage for the rest. This is custody, with the licensing above, and key management with the discipline of [HSMs & Key Management](/books/payments/key-management): signing keys in hardware, multi-party approval for large transfers, and withdrawal allowlists.
- **Non-custodial** for the payer: the payer signs from their own wallet and the provider only watches the chain. That's the normal case for pay-ins; it's what makes the payer's address unknown, and therefore something to screen.

My default is to let a ramp or a qualified custodian hold the tokens and keep the provider's own role to quoting, screening, matching and the ledger. Holding keys is a business of its own.

### Screening Wallets and Addresses

Sanctions law doesn't change on a blockchain. OFAC is explicit: for virtual currency, "the obligations are the same" as for fiat. It publishes digital currency addresses on the SDN List but warns the listings "are not likely to be exhaustive," so matching an address against the list isn't enough. Blocked virtual currency must be held so that no party can access it, and reported to OFAC within 10 business days and annually after that. OFAC's guidance for the virtual currency industry recommends sanctions list and geographic screening, and points to blockchain analytics and geolocation tools.

In practice: screen the **counterparty address** of every inbound and outbound transfer with a blockchain analytics provider, which scores the address by its exposure to sanctioned entities, mixers, stolen funds and darknet markets, and screen it again before each payout, because an address's history grows. Screen the **IP and location** of the session that requested the payment. Record the result, the provider, the list version and the score on the transfer, so the decision can be shown later. A hit on an inbound transfer is a blocked-property problem, not a refund: you can't simply send it back. The broader program is in [Gatekeeping: Sanctions, AML and Losses](/books/payments/becoming-a-payment-provider#gatekeeping-sanctions-aml-and-losses).

### The Travel Rule

The funds travel rule (31 CFR 1010.410(f)) requires a US financial institution sending a transmittal of $3,000 or more to include the sender's name, account number and address, the amount, the date, the recipient's institution and whatever recipient details it received, and an intermediary to pass them on. FinCEN's 2019 guidance applies it to convertible virtual currency: a transmittal involving it is an instruction to pay "a determinable amount of money," so it can fall within the rule. FATF's standards set the global baseline for virtual asset service providers, with countries allowed a de minimis threshold of USD or EUR 1,000 below which less is required, and the EU applies it with no threshold at all. FATF revised its Recommendation 16 for funds transfers in June 2025, with the changes generally expected to take effect by the end of 2030 as jurisdictions adopt them.

The blockchain carries none of this data, so a provider sending tokens to another exchange or custodian exchanges it out of band, over one of the travel rule messaging networks, before or alongside the transfer. Sending to a self-hosted wallet has no counterparty institution to message, so the record holds what you collected from your own customer instead, including how they showed the wallet is theirs where your regulator asks for it. Model it as a record linked to the transfer, with its own status, because a missing or incomplete message on an inbound transfer is a reason to hold the funds.

### Confirmations, Reorgs and Monitoring the Chain

A provider learns about transfers by watching the chain: running nodes or using a node provider, following the token contract's transfer events to its addresses, and tracking each one to finality. Three rules:

- **Store the block hash with the block number.** If the chain reorganizes, the transfer's block hash changes or the transfer disappears; a transfer you'd marked `included` in an orphaned block goes back to `seen` or to `dropped`. Credit nothing until `final`.
- **Use the chain's own definition of final,** not a single number for every chain. Circle's table above is a reasonable starting point; a rollup's quick confirmation is not Ethereum's finality.
- **Two independent sources.** Your node can lag or fork; check finality against a second provider before releasing funds above a threshold.

### Gas, Fees and Who Pays Them

The provider pays network fees on everything it sends: payouts, refunds, sweeps from deposit addresses to the treasury wallet, and redemptions. They're paid in the chain's native coin, so each operational wallet keeps a float of it, monitored like any other balance, and fees move with network demand. Book each fee as its own ledger entry in the native asset, and decide who bears it: the merchant (deducted like a processing fee), the payout recipient, or the platform. A failed transfer still pays its fee.

### Wrong Addresses and Wrong Chains

Nobody can reverse a transfer to the wrong address, and a token sent on a chain your address doesn't watch, or a token you don't support, may be gone for good. Bridge's documentation is blunt: it "does not support returning unsupported currencies," and funds sent in an unlisted currency "may be unrecoverable." Prevention is the whole control:

- **Show the network as prominently as the address,** and generate a deposit address per network, so the payer can't paste a Solana address into an Ethereum send.
- **Validate addresses before every payout:** the format for that chain (EVM addresses carry a mixed-case checksum, EIP-55), that it isn't a token contract, and that it's the address on file.
- **Watch for the unexpected:** transfers of unsupported tokens to your addresses go to a review queue with a written policy, not to silence.

### Refunds Without Chargebacks

A stablecoin pay-in has no dispute process: Stripe lists dispute support as "No," and its refunds go back "as stablecoins to the customer's original wallet." That's good for the merchant and a gap for the payer, who loses the protection a card gives. The provider's terms fill it, so write them: who can request a refund, to which address (the original sender address can be an exchange's pooled wallet that won't credit the payer, so ask for and screen a refund address), at what token amount, and who pays the network fee. A refund is a payout, final when sent, with the payout controls. Cards keep [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks); this rail keeps a complaints process ([Complaints and Error Resolution](/books/payments/operating-the-platform#complaints-and-error-resolution)).

### The Ledger

A token is a currency in the ledger, with three differences from a fiat one:

- **Its own code and precision.** `USDC` isn't an ISO 4217 code, doesn't fit `CHAR(3)`, and has six decimals rather than two. Amounts are integers in the token's base units. A six-decimal token fits `BIGINT` comfortably; an 18-decimal token overflows it past about 9.2 tokens, so on-chain raw amounts are stored as `NUMERIC(78,0)` (a 256-bit integer) and only six-or-fewer-decimal tokens enter balance accounts in `BIGINT`.
- **Accounts per asset per chain per wallet.** USDC on Solana in a hot wallet is a different account from USDC on Ethereum in cold storage, because each reconciles to a different on-chain balance and moving between them costs a transfer.
- **Conversion is a trade, even at par.** Redeeming 1,000 USDC for $1,000 is two legs linked by one ID, like any FX conversion ([Multi-Currency Ledgers](/books/payments/ledger-and-reconciliation#multi-currency-ledgers)), with the ramp's fee and any rate difference posted to their own accounts. Never treat one USDC as one dollar in a balance; it's a claim on an issuer, worth a dollar while the issuer is good.

### Reconciliation Against the Chain

The chain is a source of truth you can query at any moment, which makes [reconciliation](/books/payments/ledger-and-reconciliation#three-sources-of-truth) stricter, not looser. Daily, for each wallet and asset: the ledger balance at a block height equals the token contract's balance for that address at that block, plus native-coin balances against fees booked. Every on-chain transfer to or from a provider address matches exactly one ledger transaction, and the unmatched ones (dust sent by strangers, unsupported tokens, transfers you didn't initiate) are breaks with an owner ([Breaks](/books/payments/ledger-and-reconciliation#breaks)). The ramp reconciles like a bank: its statement of tokens received and dollars wired against your transfers and your bank's credits.

### Accounting Treatment

The financial statements are a separate question from the ledger, and the US answer was still moving in October 2026. FASB's crypto asset standard (ASU 2023-08) excludes tokens that give the holder enforceable rights to or claims on other assets, which can take a redeemable stablecoin out of its scope; Deloitte's reading is that each stablecoin's terms must be evaluated, and some will be financial assets. On August 18, 2026, FASB proposed examples for when a stablecoin is a cash equivalent: an on-demand cash redemption right, redeemed directly with the issuer, and segregated one-to-one reserves in short-term liquid assets. Comments are due November 19, 2026, no effective date is set, and once the GENIUS Act is effective it generally bars treating a non-permitted issuer's stablecoin as cash or a cash equivalent. Classify with your auditors, per token, before the balance is material.

## When Not To

Stablecoins solve particular problems well and most others badly.

**They help** where the bank rail is the problem: cross-border payouts to people whose local banking is slow or expensive, treasury that needs to move on weekends (the reason Visa and Mastercard settle in them), marketplaces with sellers who already hold crypto, and merchants whose customers already hold stablecoins and want to spend them.

**They don't help** a US merchant selling to US consumers who pay by card or ACH: cards carry rewards, credit and chargeback protection that payers value, and ACH is cheap. Nor do they help a provider without the compliance capacity for wallet screening, the travel rule and possibly custody licensing, because those costs arrive before the first payment. My rule: add stablecoins as a payout rail or a settlement option where a customer is asking for it and the corridor is bad, and as a checkout method only through a provider or ramp that carries the conversion and custody, until volume justifies more.

## How to Build It

These are deltas against [the core data model](/books/payments/card-payments#the-core-data-model). Tokens become assets with their own precision, every on-chain movement is its own record tracked to finality, and the ledger widens its currency column to take them.

```sql
CREATE TABLE assets (                        -- one row per token per chain
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  code             TEXT NOT NULL UNIQUE,     -- 'USDC.solana', 'USDC.ethereum', 'ETH.ethereum'
  symbol           TEXT NOT NULL,            -- 'USDC'
  chain            TEXT NOT NULL,            -- 'ethereum', 'solana', 'base', ...
  contract_address TEXT,                     -- token contract or mint; NULL for a chain's native coin
  issuer           TEXT,
  decimals         SMALLINT NOT NULL CHECK (decimals BETWEEN 0 AND 18),
  pegged_to        CHAR(3),                  -- 'USD'; NULL for a native coin used for fees
  finality_rule    TEXT NOT NULL,            -- 'finalized_tag', 'confirmations:32', ...
  status           TEXT NOT NULL CHECK (status IN ('active', 'deposits_paused', 'retired')),
  UNIQUE (chain, contract_address)
);

-- The ledger takes asset codes as well as ISO currencies.
ALTER TABLE ledger_accounts ALTER COLUMN currency TYPE TEXT;
ALTER TABLE ledger_entries  ALTER COLUMN currency TYPE TEXT;

CREATE TABLE wallet_addresses (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  chain          TEXT NOT NULL,
  address        TEXT NOT NULL,              -- stored as the chain writes it (checksummed for EVM)
  role           TEXT NOT NULL CHECK (role IN ('deposit', 'hot', 'cold', 'ramp', 'counterparty')),
  custody        TEXT NOT NULL CHECK (custody IN ('provider', 'custodian', 'ramp', 'self_hosted')),
  custodian      TEXT,
  merchant_id    UUID REFERENCES merchants (id),
  payment_id     UUID REFERENCES payments (id),  -- a deposit address issued for one payment
  verified_by    TEXT,                       -- out-of-band check of a payout address
  verified_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (chain, address)
);

CREATE TABLE address_screenings (            -- append-only: every check, kept
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_address_id  UUID NOT NULL REFERENCES wallet_addresses (id),
  screened_for       TEXT NOT NULL CHECK (screened_for IN ('inbound', 'payout', 'refund', 'periodic')),
  provider           TEXT NOT NULL,          -- the analytics vendor, or 'ofac_sdn'
  list_version       TEXT,
  risk_score         NUMERIC(5,2),
  result             TEXT NOT NULL CHECK (result IN ('clear', 'review', 'blocked')),
  raw_response       JSONB NOT NULL,
  screened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stablecoin_quotes (             -- what the payer was asked to send
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_id       UUID NOT NULL REFERENCES payments (id),
  asset_id         UUID NOT NULL REFERENCES assets (id),
  deposit_address_id UUID NOT NULL REFERENCES wallet_addresses (id),
  amount_base_units NUMERIC(78,0) NOT NULL CHECK (amount_base_units > 0),
  expires_at       TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('open', 'paid', 'underpaid', 'overpaid', 'expired', 'canceled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE onchain_transfers (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_id          UUID NOT NULL REFERENCES assets (id),
  tx_hash           TEXT NOT NULL,
  log_index         INTEGER NOT NULL DEFAULT 0,   -- one transaction can carry several transfers
  direction         TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
  from_address      TEXT NOT NULL,
  to_address        TEXT NOT NULL,
  amount_base_units NUMERIC(78,0) NOT NULL,
  block_number      BIGINT,
  block_hash        TEXT,                    -- changes, or vanishes, on a reorg
  status            TEXT NOT NULL CHECK (status IN ('broadcast', 'seen', 'included', 'final', 'dropped', 'failed')),
  network_fee       NUMERIC(78,0),           -- in the chain's native coin, outbound only
  quote_id          UUID REFERENCES stablecoin_quotes (id),
  payout_id         UUID REFERENCES payouts (id),
  refund_id         UUID REFERENCES refunds (id),
  screening_id      UUID REFERENCES address_screenings (id),
  idempotency_key   TEXT UNIQUE,             -- outbound: one signed send per instruction
  first_seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  final_at          TIMESTAMPTZ,
  UNIQUE (asset_id, tx_hash, log_index)
);

CREATE TABLE travel_rule_records (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  onchain_transfer_id UUID NOT NULL REFERENCES onchain_transfers (id),
  counterparty_type   TEXT NOT NULL CHECK (counterparty_type IN ('vasp', 'self_hosted')),
  counterparty_vasp   TEXT,
  protocol            TEXT,                  -- the messaging network used
  originator          JSONB NOT NULL,        -- name, account (address), address, as sent or received
  beneficiary         JSONB NOT NULL,
  ownership_proof     TEXT,                  -- for a self-hosted wallet, how ownership was shown
  status              TEXT NOT NULL CHECK (status IN ('not_required', 'sent', 'received', 'incomplete', 'rejected')),
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ramp_orders (                   -- conversions at the ramp or issuer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ramp                TEXT NOT NULL,
  direction           TEXT NOT NULL CHECK (direction IN ('off', 'on')),
  asset_id            UUID NOT NULL REFERENCES assets (id),
  amount_base_units   NUMERIC(78,0) NOT NULL,
  fiat_currency       CHAR(3) NOT NULL,
  fiat_amount         BIGINT,                -- minor units, when known
  fee                 BIGINT NOT NULL DEFAULT 0,
  onchain_transfer_id UUID REFERENCES onchain_transfers (id),
  bank_reference      TEXT,                  -- the wire or ACH that carried the dollars
  external_reference  TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('pending', 'tokens_received', 'fiat_sent', 'settled', 'failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at          TIMESTAMPTZ,
  UNIQUE (ramp, external_reference)
);
```

The payment's state follows its transfers: a quote's inbound transfer reaching `final` (and a `clear` screening) is what moves the payment to `succeeded`, and only then does a ledger transaction post the tokens to the merchant's pending balance, keyed `('onchain_transfer', id)` so it posts once. A transfer that moves from `included` back to `seen` after a reorg posts nothing, because nothing posted before `final`. The ramp order's `settled` status, matched to the bank credit, posts the conversion's two legs and makes the merchant's dollars available for a normal [payout](/books/payments/payouts-and-settlement). Outbound sends carry an idempotency key, so a retried payout finds the signed transaction it already broadcast instead of paying twice ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).

## Auditing

A sponsor bank, a state examiner or a MiCA supervisor asks the same questions of a stablecoin program, and the evidence is the records above:

- **The issuers you rely on.** For each supported token: the issuer's regulatory status, its latest monthly reserve report and the accountant's examination of it (the GENIUS Act and NYDFS both require monthly examination; Circle publishes monthly assurance reports), and who approved adding the token and when. Review it monthly; a token whose attestations stop is a token you stop accepting.
- **Screening evidence per transfer:** which address was screened, by which provider, against which list version, with what result, and who cleared any review, before funds were credited or sent.
- **Blocked property:** any blocked tokens, the date of blocking, and the reports to OFAC within 10 business days and annually.
- **Travel rule records** for every transfer over the applicable threshold, including incomplete or rejected messages and what was done with the funds.
- **Daily reconciliation at a block height:** ledger balances against on-chain balances per wallet and asset, the ramp's statements against your transfers, and every break with its resolution.
- **Key custody:** who can sign, the approval policy for large transfers, the withdrawal allowlist and every change to it, or the custodian's equivalent reports if you don't hold keys ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Payout address changes,** with the out-of-band verification and the first-payout hold, as for bank details.

## What This Means for the System You Build

- **A token is an asset per chain** with its own decimals, contract and finality rule, and the ledger keeps a separate account for each asset in each wallet.
- **Credit at finality, never at sight,** with block hashes stored so a reorg can be detected rather than discovered.
- **One deposit address per payment and a quote that expires,** with underpaid, overpaid and late as states, not exceptions.
- **Screen every counterparty address,** inbound and before every send, and keep the result with the transfer.
- **Travel rule data as its own record,** linked to the transfer, with a hold when it's missing.
- **Gas as a balance and a fee,** in the native coin, with an owner for who pays it.
- **Refunds as payouts** to a screened address, under terms you wrote, because no network will write them for you.
- **A supported-token list that is a compliance decision,** reviewed against each issuer's attestations and the GENIUS Act's July 2028 distribution rule.
- **Custody decided before the ledger,** with a ramp or custodian holding the keys unless holding them is the business.
- **Reconciliation against the chain at a block height,** every day.

## References

**Specifications**

- [GENIUS Act, S. 1582 (enrolled bill)](https://www.govinfo.gov/content/pkg/BILLS-119s1582enr/html/BILLS-119s1582enr.htm), the payment stablecoin definition, permitted issuers, eligible reserves, monthly reserve reports examined by a registered public accounting firm with CEO and CFO certification, the $50 billion audit threshold, fee disclosure with 7 days' notice, the yield ban, BSA treatment, lawful orders, insolvency priority, the three-year distribution rule, the one-year rulemaking deadline (section 13) and the effective date (section 20)
- [Covington: The GENIUS Act becomes law](https://www.cov.com/en/news-and-insights/insights/2025/07/the-genius-act-becomes-law-key-provisions-from-the-federal-stablecoin-regulatory-framework), the three kinds of permitted issuer and the state option for issuers with $10 billion or less outstanding
- [Regulation (EU) 2023/1114 (MiCA), Article 48](https://www.springlex.eu/en/packages/mica/mica-regulation/article-48/), who may offer e-money tokens, and EMTs deemed electronic money
- [MiCA, Article 49](https://www.springlex.eu/en/packages/mica/mica-regulation/article-49/), issuance at par on receipt of funds and redemption at any time at par without a fee
- [MiCA, Article 50](https://www.springlex.eu/en/packages/mica/mica-regulation/article-50/), no interest from issuers or CASPs, including time-based benefits
- [MiCA, Article 149](https://www.springlex.eu/en/packages/mica/mica-regulation/article-149/), Titles III and IV applying from June 30, 2024 and the rest from December 30, 2024
- [31 CFR 1010.410](https://www.law.cornell.edu/cfr/text/31/1010.410), the funds travel rule for transmittals of $3,000 or more
- [Federal Register: OCC final rule implementing the GENIUS Act (October 23, 2026)](https://www.federalregister.gov/documents/2026/10/23/2026-21706/implementing-the-guiding-and-establishing-national-innovation-for-us-stablecoins-act-for-the), the OCC's final rule as published
- [Federal Register: FDIC proposal on requirements for FDIC-supervised issuers (April 10, 2026)](https://www.federalregister.gov/documents/2026/04/10/2026-06974/genius-act-requirements-and-standards-for-fdic-supervised-permitted-payment-stablecoin-issuers-and), the FDIC's requirements proposal

**Reference**

- [OCC: Final rule to implement the GENIUS Act (October 21, 2026)](https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-92.html), scope of the OCC rule, January 18, 2027 effective date, and AML and sanctions left to a separate rulemaking with Treasury
- [WilmerHale: OCC finalizes GENIUS Act rule](https://www.wilmerhale.com/en/insights/client-alerts/20261027-occ-finalizes-genius-act-rule-for-permitted-payment-stablecoin-issuers-easing-several-key-proposed-requirements-and-raising-new-issues), two-business-day redemption kept, the 24-hour notice when requests exceed 10% of outstanding issuance, and changes from the proposal
- [FDIC: Comment period extended on GENIUS Act proposal](https://fdic.gov/news/financial-institution-letters/2026/fdic-extends-comment-period-notice-proposed-rulemaking), the applications proposal's comment period extended to May 18, 2026
- [Sullivan & Cromwell: Federal Reserve proposes rules; SCRC adopts interim procedures](https://www.sullcrom.com/insights/memo/2026/October/Federal-Reserve-Proposes-Rules-Payment-Stablecoin-Issuers-Stablecoin-Certification-Review-Committee-Adopts-Interim-Procedures), the Fed's September 24, 2026 proposals with comments due November 30, the SCRC interim final rule of September 30, 2026, the January 18, 2028 certification deadline, and Treasury's April 3, 2026 principles proposal
- [Baker McKenzie: Treasury proposes AML and sanctions program rule for stablecoin issuers](https://blockchain.bakermckenzie.com/2026/04/23/us-treasury-department-proposes-rule-to-implement-genius-acts-anti-money-laundering-and-sanctions-compliance-program-requirements-for-stablecoin-issuers/), the FinCEN and OFAC proposal of April 8, 2026 and the June 9, 2026 comment deadline
- [The Block: US regulators miss the GENIUS Act's one-year deadline](https://www.theblock.co/post/408843/us-regulators-miss-genius-acts-one-year-deadline-for-final-stablecoin-rules), no final rules by July 18, 2026
- [NYDFS: Guidance on the issuance of US dollar-backed stablecoins (June 8, 2022)](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20220608_issuance_stablecoins), redemption within two business days, permitted reserve assets, monthly CPA examination and annual internal controls report
- [FinCEN: Application of FinCEN's regulations to certain business models involving convertible virtual currencies (FIN-2019-G001)](https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-certain-business-models), CVC transmitters as money transmitters, hosted and unhosted wallets, and the travel rule applied to CVC
- [OFAC: Sanctions compliance guidance for the virtual currency industry (October 15, 2021)](https://ofac.treasury.gov/recent-actions/20211015), list and geographic screening for virtual currency businesses
- [OFAC: Questions on virtual currency](https://ofac.treasury.gov/faqs/topic/1626), the same obligations as fiat, non-exhaustive address listings, and blocking and reporting within 10 business days
- [FATF: Updated guidance for a risk-based approach to virtual assets and VASPs](https://www.fatf-gafi.org/content/dam/fatf-gafi/guidance/Updated-Guidance-VA-VASP.pdf), the travel rule for VASPs and the optional USD/EUR 1,000 de minimis threshold
- [Mayer Brown: FATF revises AML standards for certain funds transfers](https://www.mayerbrown.com/en/insights/publications/2025/08/fatf-revises-aml-standards-for-certain-funds-transfers), the June 18, 2025 revision of Recommendation 16, generally effective by the end of 2030
- [EBA: Travel rule guidelines under Regulation (EU) 2023/1113](https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/anti-money-laundering-and-countering-financing-terrorism/guidelines-information-requirements-relation-transfers-funds-and-certain-crypto-assets-transfers), information accompanying crypto-asset transfers, applying from December 30, 2024
- [Elvinger Hoss: MiCA transitional period has come to an end](https://elvingerhoss.lu/insights/publications/mica-transitional-period-has-come-end-what-comes-next-casps), CASP transitional periods ending July 1, 2026
- [FCA: Cryptoasset regime policy statements](https://www.fca.org.uk/publications/policy-statements/cryptoasset-regime), the regulations passed February 4, 2026, policy statements of June 30, 2026, the application window from September 30, 2026 to February 28, 2027, and the regime from October 25, 2027
- [FCA: PS26/10 Stablecoin issuance](https://www.fca.org.uk/publication/policy/ps26-10.pdf), backing assets on statutory trust per product and redemption by the end of the next business day
- [Bank of England and FCA: Approach to joint regulation of systemic stablecoin issuers](https://www.bankofengland.co.uk/paper/2026/boe-and-fcas-approach-to-joint-regulation-of-systemic-stablecoin-issuers), the shared regime for systemic sterling stablecoins
- [Deloitte: FASB proposes clarifications on cash equivalents and certain digital assets](https://dart.deloitte.com/USDART/home/publications/deloitte/heads-up/2026/fasb-proposes-enhancements-disclosures-cash-equivalents-clarifications-evaluation-certain-digital-as), the August 18, 2026 proposal, its three attributes, the November 19, 2026 comment deadline and the GENIUS Act's bar on non-permitted stablecoins as cash equivalents
- [Deloitte: FAQ on the FASB's crypto assets standard (ASU 2023-08)](https://dart.deloitte.com/USDART/home/publications/deloitte/heads-up/2024/faq-fasb-crypto-assets-standard-asu-2023-08), stablecoins evaluated on their terms, some as financial assets, and the scope exclusion for enforceable claims on other assets
- [Ethereum: Gas and fees](https://ethereum.org/developers/docs/gas/), fees paid in ETH and charged on failed transactions
- [Ethereum Improvement Proposal 55](https://eips.ethereum.org/EIPS/eip-55), the mixed-case checksum for addresses
- [OCC: Conditional approvals for five national trust bank charters (December 12, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html), Circle's and Ripple's de novo trust banks and the conversions of BitGo, Fidelity Digital Assets and Paxos

**In practice**

- [Bridge: Liquidation addresses](https://apidocs.bridge.xyz/platform/orchestration/liquidation_address/liquidation_address), permanent routes from a blockchain address to a bank account or another address
- [Bridge: Multi-chain liquidation addresses](https://apidocs.bridge.xyz/platform/orchestration/liquidation_address/multi-chain-currency), unsupported currencies not returned and possibly unrecoverable
- [Bridge: Virtual accounts](https://apidocs.bridge.xyz/platform/orchestration/virtual_accounts/virtual-account), reusable fiat deposit addresses that convert to tokens, and the rails they accept
- [Checkout.com: Stablecoin settlement for US merchants with Fireblocks](https://www.checkout.com/newsroom/checkout-com-scales-stablecoin-settlement-for-us-merchants-in-partnership-with-fireblocks), the June 3, 2026 launch, settlement to a merchant's wallet and the excluded states
- [Circle: Transparency and stability](https://www.circle.com/transparency), USDC reserves in the Circle Reserve Fund and cash, weekly disclosure and monthly assurance by a Big Four firm
- [Circle: Required block confirmations](https://developers.circle.com/cctp/required-block-confirmations), hard finality and its time per chain
- [Circle: USDC contract addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses), the chains USDC is deployed on and the bridged `USDC.e` not issued by Circle
- [Circle: Transfer USDC on Solana](https://developers.circle.com/stablecoins/quickstart-transfer-10-usdc-on-solana), USDC's six decimal places
- [Circle: First global stablecoin issuer to comply with MiCA (July 1, 2024)](https://www.circle.com/pressroom/circle-is-first-global-stablecoin-issuer-to-comply-with-mica-eus-landmark-crypto-law), the ACPR e-money license and MiCA-compliant USDC and EURC
- [Bridge: Conditional OCC approval to organize a national trust bank (February 17, 2026)](https://bridge.xyz/blog/bridge-receives-occ-conditional-approval-to-organize-a-federally-chartered-national-trust-bank), custody, stablecoin issuance and reserve management once the charter is final
- [Mastercard: Expands settlement capabilities to include stablecoin (June 2026)](https://www.mastercard.com/in/en/news-and-trends/press/2026/june/mastercard-expands-settlement-capabilities-to-include-stablecoin.html), issuer and acquirer settlement in USDC, PYUSD, USDG, USDP, RLUSD and SoFiUSD, and the first institutions
- [Mastercard: Completes acquisition of BVNK (August 3, 2026)](https://investor.mastercard.com/investor-news/investor-news-details/2026/Mastercard-completes-acquisition-of-BVNK-to-advance-global-stablecoin-capabilities/default.aspx), the completed acquisition
- [PayPal: Business fees](https://www.paypal.com/us/business/paypal-business-fees), Pay with Crypto at 0.99% until July 31, 2026 and 1.5% from August 1, 2026
- [PayPal: What is PayPal USD (PYUSD)?](https://www.paypal.com/us/cshelp/article/what-is-paypal-usd-pyusd-help1005), issued by Paxos, its reserves and the chains it runs on
- [PayPal: Pay with Crypto terms](https://www.paypal.com/us/legalhub/paypal/crypto-payment-method?locale.x=en_US), conversion and crediting the business in dollars
- [Shift4: Global stablecoin settlement platform (December 22, 2025)](https://investors.shift4.com/news-events/press-releases/detail/288/shift4-launches-global-stablecoin-settlement-platform-unlocking-faster-payments-for-merchants), opt-in settlement in USDC, USDT, EURC and DAI and the supported networks
- [Stripe: Completes Bridge acquisition](https://stripe.com/newsroom/news/stripe-completes-bridge-acquisition), February 4, 2025
- [Stripe: Stablecoin payments](https://docs.stripe.com/crypto/stablecoin-payments), accepted tokens and networks, business locations, settlement in local currency, the $10,000 limit, refunds to the original wallet and no disputes
- [Stripe: Stablecoins in Treasury](https://docs.stripe.com/financial-accounts/stablecoins), stablecoin balances and payouts to wallets or as local currency to bank accounts
- [Visa: Stablecoin settlement in the United States (December 16, 2025)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21951.html), USDC settlement for US issuers and acquirers, Cross River Bank and Lead Bank, Solana, and seven-day settlement
- [Visa: Adding five blockchains for settlement (April 29, 2026)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.22336.html), nine chains, the $7 billion annualized run rate and 130+ stablecoin-linked card programs in more than 50 countries
- [Worldpay: Stablecoin payouts with BVNK (May 27, 2025)](https://www.worldpay.com/en/news/worldpay-enable-stablecoin-payouts-global-businesses), payouts to more than 180 markets without the client holding stablecoins
