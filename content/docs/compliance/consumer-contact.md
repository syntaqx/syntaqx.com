+++
title = "Calls, Texts & Email"
description = "The law behind contacting customers: TCPA consent and revocation, calling hours, AI voices and disclosure, call recording, CTIA texting rules and CAN-SPAM."
category = "Compliance"
order = 906
tags = ["compliance", "tcpa", "sms", "email", "consent", "recording"]
aliases = ["consumer-contact"]
+++

Most products eventually reach out to people: a bank texts a fraud alert, a clinic calls with an appointment reminder, a marketplace emails a promotion, a game studio texts a login code, a home-service company has an AI call lapsed customers. In the US, each of those falls under a different mix of federal statute, FCC rules, state law, carrier rules and mailbox-provider policy, and the penalties are set per message. The Telephone Consumer Protection Act gives consumers a private right of action for $500 per violation, and a court can triple it for willful or knowing violations. Multiply by a reminder campaign and it's clear why TCPA suits are filed as class actions. A store's marketing texts and the cases pending over them are the Commerce volume's [The Courts, as of October 2026](/books/commerce/email-sms-and-lifecycle#the-courts-as-of-october-2026), and the disclosure laws for a store's support bot are its [Disclosure Laws](/books/commerce/customer-service#disclosure-laws).

The rules look scattered, but they share one shape: **consent for a purpose, revocable any time, honored quickly, with records that prove it.** [Notifications & Consent](/docs/architecture/notifications) is the system that enforces them; this chapter is what it enforces. It isn't legal advice: which rules reach which messages depends on facts that are a question for counsel, and this area changes often (the revocation rules below changed in September 2026).

## Which Rules Apply

| Channel | US law | Industry rules |
| --- | --- | --- |
| Automated calls and texts | TCPA and the FCC's rules at 47 CFR 64.1200; state telemarketing laws | CTIA Messaging Principles, carrier registration (10DLC, toll-free, short codes) |
| Live telemarketing calls | Do-not-call rules and calling hours in 64.1200; state laws | |
| AI or prerecorded voice calls | TCPA "artificial or prerecorded voice" rules | |
| Call and conversation recording | Federal wiretap law; state recording laws | |
| AI chat and voice agents | State bot and AI disclosure laws | |
| Commercial email | CAN-SPAM | Mailbox-provider sender requirements |

Collection messages add debt-collection law for third-party collectors (the FDCPA and Regulation F); [Collections & Retention](/books/field-operations/collections-and-retention) is an example of how they shape contact limits.

## TCPA Consent

The TCPA itself bars calls to cell phones using an autodialer or an artificial or prerecorded voice without the called party's **prior express consent**, unless the call is for an emergency. The FCC treats texts as calls for this purpose, and its rules split consent by what the message is.

Two Supreme Court decisions changed how far those rules reach. *Facebook v. Duguid* (2021) narrowed "autodialer" to equipment with the capacity to use a random or sequential number generator, and *McLaughlin Chiropractic v. McKesson* (2025) held that the Hobbs Act doesn't bind district courts to the FCC's interpretation of the statute, so courts now decide for themselves what the TCPA means. *Duguid* leaves the artificial or prerecorded voice rules untouched, and the FCC's regulations still apply. *McLaughlin* means an FCC interpretation, such as its 2024 ruling on AI voices below, gets a court's respect rather than its obedience. That's a question for counsel, not a reason to send more.

The consent split:

- **Informational** messages (a receipt, a delivery update, an appointment reminder, a fraud alert) need **prior express consent**, which in practice usually means the person gave you the number for that kind of contact.
- **Telemarketing and advertisements** need **prior express written consent**: a written agreement bearing the signature of the person called (an electronic signature counts where federal or state law recognizes it; see [Electronic Signatures & Records](/docs/compliance/electronic-signatures)), authorizing that seller to deliver such messages to that number, and disclosing that agreeing is not a condition of purchase.

The split is about content, not intent. A reminder that ends with a coupon is an advertisement, and needs the stronger consent. That's why the consent ledger in [Notifications & Consent](/docs/architecture/notifications#the-consent-ledger) is keyed by purpose, and why purpose is set on the template rather than guessed at send time.

## Revoking Consent

Revocation is where the rules have moved most, and where older guides disagree, so here's the sequence as of October 2026:

1. **The 2024 TCPA Consent Order** adopted 64.1200(a)(10), effective April 11, 2025: consent can be revoked by any reasonable method, honored within a reasonable time not exceeding **ten business days**. Replies of "stop", "quit", "end", "revoke", "opt out", "cancel" or "unsubscribe" count, and one confirmation text, with no marketing in it, is presumed fine if sent within five minutes.
2. **The "revoke all" provision** in that rule (a revocation in response to one kind of message stops all of a caller's robocalls and robotexts) was waived by the FCC's Consumer and Governmental Affairs Bureau, first to April 11, 2026 and then, in DA 26-12 (January 6, 2026), to **January 31, 2027**.
3. **FCC 26-67**, adopted September 30, 2026, published in the Federal Register on October 26, 2026 and **effective November 25, 2026**, replaces the revoke-all provision before it ever took effect, and supersedes the January 2027 date.

Under the amended rule, from November 25, 2026:

- **Informational revocations can be scoped.** A caller may treat a revocation in response to an informational message as applying only to that category: a customer who stops payment reminders can still get fraud alerts and appointment reminders.
- **Marketing revocations aren't.** A revocation in response to a marketing message revokes consent to all future marketing calls and texts from that caller.
- **Callers may designate an exclusive revocation method:** an automated voice or key-press opt-out on a call, a reply text using one of the standard words, and/or a website or phone number for opt-outs. The method must be disclosed clearly and conspicuously on each call or text (for texts, including one of the standard words is enough). A caller that designates one need not process requests made other ways; a caller that doesn't must still accept any reasonable means.
- **Ten business days and the five-minute confirmation text are unchanged.**
- **Still open:** the order's further notice asks whether to require a one-step revoke-all method, shorten the honoring period, and require two-way texting. Expect more change.

For the system, that means a STOP is recorded against the purpose of the message it answered, a reply to a marketing message revokes all marketing, and offering a "stop everything" option is cheap insurance against the rule the FCC is still considering. The [phone payments](/books/payments/phone-payments) and [field operations](/books/field-operations/customer-communications) books give examples in their industries.

## Calling Hours and Do-Not-Call

- **Calling hours.** Telephone solicitations only between **8 a.m. and 9 p.m.**, local time at the called party's location. Not the caller's time zone, and not UTC.
- **Do-not-call.** A residential subscriber's request not to receive telemarketing must be honored within ten business days and **for five years**. The National Do Not Call Registry applies to telephone solicitations unless an exemption fits, such as an established business relationship: a purchase or transaction within the prior **18 months**, or an inquiry within the prior **three months**.
- **Artificial or prerecorded messages** must identify the business responsible at the start and give a callback number; telemarketing ones must also offer an automated, interactive voice or key-press opt-out.

**State laws are often stricter.** Florida, for example, bars commercial telephone solicitation calls before 8 a.m. or after 8 p.m. in the called person's time zone, and more than three calls in 24 hours on the same subject. Other states set their own windows, holidays and caps, and they change, so store them as dated rules with sources rather than trusting a table ([Notifications & Consent](/docs/architecture/notifications#one-outbound-gate)).

## Reassigned Numbers

Phone numbers are reassigned, so consent from a customer three years ago may now belong to a stranger, who never consented. The FCC's Reassigned Numbers Database answers whether a number has been permanently disconnected since a given date. A caller who checks it and gets an erroneous "no" has a safe harbor, and bears the burden of proving it checked. Record the date of each check against the contact point, and check before automated messages to numbers whose consent is old.

## Artificial and AI Voices

In a February 2024 declaratory ruling (FCC 24-17), the FCC confirmed that the TCPA's restrictions on "artificial or prerecorded voice" encompass current AI technologies that generate human voices, including voice cloning. An AI voice that places calls is making artificial-voice calls: it needs the called party's prior express consent (written, for telemarketing) and must meet the identification and opt-out rules above. The ruling is about initiating calls. An AI that answers inbound calls is governed by disclosure and recording law instead, and the engineering is in [AI Agents in the Product](/docs/architecture/ai-agents).

## Telling People They're Talking to an AI

State disclosure laws differ in trigger and scope. Two examples show the range:

- **California's** bot law (B&P Code 17941) makes it unlawful to use a bot to communicate with a person in California online with intent to mislead them about its artificial identity in order to incentivize a sale; a clear, conspicuous disclosure that it's a bot is a complete defense.
- **Utah's** AI law, as amended effective May 7, 2025, requires disclosure that a consumer is interacting with generative AI when they clearly ask, requires prominent up-front disclosure only in "high-risk" interactions (collecting sensitive data, or advice people rely on for significant decisions), and gives a safe harbor to anyone who discloses at the outset and throughout. The law is currently set to be repealed in July 2027.

Both point to the same design, which also satisfies the stricter laws: **the agent says it's an AI at the start of every interaction, answers honestly when asked, and the system records which greeting version played.**

## Recording Calls

Federal law is a **one-party** rule: 18 U.S.C. 2511(2)(d) permits a private person to intercept a communication they're a party to, or where one party has consented, unless it's for a criminal or tortious purpose. A minority of states require **every party's consent** to record a private or confidential conversation. Three examples:

- **California** (Penal Code 632) prohibits recording a confidential communication without the consent of all parties.
- **Illinois** re-established all-party consent for secretly recording private conversations in Public Act 98-1142, effective December 30, 2014, after its state supreme court struck down the earlier, broader statute. Older guides that list Illinois as struck down are out of date.
- **Washington** (RCW 9.73.030) requires all participants' consent, and treats consent as given when one party announces to all others, in any reasonably effective manner, that the conversation will be recorded, with the announcement itself recorded.

A call can cross state lines, and you rarely know where a mobile caller is. Washington's rule is the one to build to everywhere: **announce recording at the start of every call, and capture the announcement in the recording.** Then no state table is needed to get it right.

## Texting: The Carrier Layer

US carriers enforce rules stricter than the law through registration and filtering, written down in CTIA's Messaging Principles and Best Practices:

- **Three message types, escalating consent.** Conversational messages (replies to the consumer) carry implied consent; informational messages need express consent; promotional messages need express written consent. Adding a call to action such as a coupon code to an informational text "may place the message in the promotional category."
- **Opt-in is per campaign** and not transferable; opt-in lists aren't shared.
- **Opt-out.** Senders should state in the message how to opt out, use standardized "STOP" wording, and honor normal-language requests too ("stop, end, unsubscribe, cancel, quit, 'please opt me out'"), with one final confirmation message and nothing after. Opt-in and opt-out records are kept.
- **Registration.** Business texting from ten-digit numbers is registered as A2P 10DLC brands and campaigns, and toll-free and short-code numbers have their own vetting; [Notifications & Consent](/docs/architecture/notifications#multi-tenant-senders) covers what that means for a platform.

A carrier can block a sender without a court, so in practice these rules bind first.

## Email: CAN-SPAM

The CAN-SPAM Act covers commercial email: accurate header information, subject lines that reflect the content, a clear disclosure that the message is an ad, a valid physical postal address, and a clear way to opt out of marketing. Opt-outs must be honored within **ten business days**, the mechanism must keep working for at least 30 days after sending, and you can't charge a fee or ask for more than an email address to opt out. An opted-out address can't be sold or transferred. Hiring a vendor to send doesn't move the responsibility: both the sender and the company whose product is promoted can be liable. Each violating email can cost up to $53,088, per the FTC's guide.

**Transactional or relationship** messages (completing a transaction, warranty or safety information, account changes) are largely exempt, but CAN-SPAM judges by **primary purpose**: if the subject line suggests an ad, or the transactional content isn't mainly at the beginning, it's commercial. Mailbox providers add authentication and one-click unsubscribe requirements on top ([Notifications & Consent](/docs/architecture/notifications#email-authentication-and-streams)).

## Outside the US

Europe and the UK start from consent rather than opt-out:

- **The EU's ePrivacy Directive** (Article 13) allows marketing by automated calls, fax and email only to people who have given prior consent, with one exception: a business that obtained an email address in the course of a sale may market its own similar products, if the customer is given an easy, free way to object when the address is collected and in every message. Each member state implements it in national law.
- **The UK's PECR** (regulation 22) has the same consent rule and "soft opt-in" for existing customers, and since February 5, 2026, a similar soft opt-in for charities whose supporters gave their details while showing interest in or supporting the charity's purposes.

What counts as valid consent, and the records to prove it, come from the GDPR; see [GDPR & Privacy](/docs/compliance/gdpr#lawful-bases).

## Checklist

| Obligation | Engineering practice |
| --- | --- |
| Consent per purpose | An append-only consent ledger per contact point and purpose, with the disclosure text version and evidence |
| Written consent for marketing | Signed consent captured with the number, seller and "not a condition of purchase" disclosure, linked from the ledger |
| Revocation in ten business days | Revocations from every channel appended immediately, scoped by purpose, with a designated method disclosed in every message |
| Calling hours and state rules | One outbound gate evaluating quiet hours in the recipient's zone, from dated, sourced rules |
| Do-not-call | Internal do-not-contact list kept five years; registry scrubbing for telemarketing |
| Reassigned numbers | Database checks recorded per contact point before automated messages on old consent |
| AI voices and agents | Consent before AI-placed calls; a versioned disclosure greeting logged per interaction |
| Recording | Announcement at the start of every call, captured in the recording |
| Email | Transactional and marketing streams separated; unsubscribes honored everywhere |
| Proof | An append-only message log recording every send and every suppression |

## References

**Specifications**

- [47 CFR 64.1200: Delivery restrictions](https://www.law.cornell.edu/cfr/text/47/64.1200), consent, prior express written consent, calling hours, do-not-call, established business relationships, prerecorded-voice identification and the reassigned-numbers safe harbor
- [47 U.S.C. 227](https://www.law.cornell.edu/uscode/text/47/227), the TCPA's consent requirement for calls to cell phones and its $500 private right of action
- [Facebook, Inc. v. Duguid (2021)](https://www.law.cornell.edu/supremecourt/text/19-511), an autodialer must have the capacity to use a random or sequential number generator
- [McLaughlin Chiropractic Associates v. McKesson Corp. (2025)](https://www.law.cornell.edu/supremecourt/text/23-1226), the Hobbs Act doesn't bind district courts to the FCC's interpretation of the TCPA
- [FCC 26-67: Report and Order and Further Notice of Proposed Rulemaking (PDF)](https://docs.fcc.gov/public/attachments/FCC-26-67A1.pdf), scoped revocation for informational messages, designated revocation methods, and the history of the revoke-all waivers
- [Federal Register: Enhancing the Ability of Consumers To Control the Robocalls](https://www.federalregister.gov/documents/2026/10/26/2026-21821/enhancing-the-ability-of-consumers-to-control-the-robocalls), FCC 26-67's publication on October 26, 2026 and November 25, 2026 effective date
- [FCC 24-17: Declaratory Ruling on AI-generated voices (PDF)](https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf), AI voices as "artificial" voices under the TCPA
- [Fla. Stat. 501.616](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.616.html), Florida's 8 a.m. to 8 p.m. window and three calls in 24 hours
- [18 U.S.C. 2511](https://www.law.cornell.edu/uscode/text/18/2511), the federal one-party consent rule for recording
- [Cal. Penal Code 632](https://california.public.law/codes/penal_code_section_632), California's all-party consent for confidential communications
- [RCW 9.73.030](https://app.leg.wa.gov/rcw/default.aspx?cite=9.73.030), Washington's all-party consent and recorded announcement
- [Cal. B&P Code 17941](https://codes.findlaw.com/ca/business-and-professions-code/bpc-sect-17941/), California's bot disclosure law
- [Directive 2002/58/EC, Article 13](https://www.legislation.gov.uk/eudr/2002/58/article/13), the EU's consent rule for electronic marketing and the existing-customer exception
- [The Privacy and Electronic Communications Regulations 2003, regulation 22](https://www.legislation.gov.uk/uksi/2003/2426/regulation/22), UK email marketing consent, the soft opt-in and the charity soft opt-in added in 2026

**Reference**

- [Davis Polk: Utah scales back its generative AI law](https://davispolk.com/insights/client-update/utah-scales-back-reach-generative-ai-consumer-protection-law), SB 226's disclosure triggers, safe harbor and repeal date
- [Illinois State Bar Association: Public Act 98-1142](https://www.isba.org/node/3939), Illinois re-establishing all-party consent for private conversations
- [CTIA: Messaging Principles and Best Practices (PDF)](https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf), message types and consent, per-campaign opt-in, opt-out wording and records
- [FTC: CAN-SPAM Act compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business), commercial email requirements, opt-out timing, primary purpose, vendor liability and penalties
- [ICO: Electronic mail marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/), the UK regulator's guidance on consent and the soft opt-in
