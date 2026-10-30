+++
title = "Suites, Bundling & Antitrust"
nav_title = "Suites & Antitrust"
description = "Why suites win procurement, the EU Teams case from Slack's complaint to binding commitments, the UK's Microsoft SMS case, bundled AI, and licensing on clouds."
category = "Workplace & Collaboration Industry"
order = 2005
part = "The Business"
tags = ["antitrust", "bundling", "competition", "microsoft-teams", "regulation"]
+++

A suite sells many products under one contract, one identity, one admin console and one price, and the price of each product inside it is whatever the vendor says it is. That is the suite's advantage in procurement and the root of the industry's competition cases. When Microsoft put Teams into Office 365 at no separate price, every employer that already paid for Word and Outlook had a chat and meetings product for nothing extra, and a standalone chat vendor had to win against a price of zero. Slack complained to the European Commission in 2020; the Commission found preliminarily that Microsoft had tied Teams to its productivity applications since at least April 2019, and in September 2025 made Microsoft's commitments to unbundle, interoperate and let customers take their data out legally binding. In 2026 the UK's competition authority took up the same territory, Copilot and AI included, under its new digital markets regime.

The cases matter to builders on both sides. A suite vendor now has to sell its products separately in some markets, price the difference visibly, keep discounts symmetric and publish interoperability; a standalone vendor gets interfaces it can build on and a customer who can switch more easily. This chapter covers why suites win, the Teams case from complaint to commitments, the UK case, bundled AI in Google Workspace and elsewhere, what bundling does to standalone vendors, and licensing restrictions on clouds, as of October 2026. Cloud infrastructure's own competition cases are the Hosting & Cloud volume's [Competition Cases](/books/hosting-and-cloud/competition-cases).

## How the Platforms Do It

| Suite | What it bundles | Standalone availability | Regulatory status, as of October 2026 |
| --- | --- | --- | --- |
| **Microsoft 365** | Word, Excel, PowerPoint, Outlook and Exchange, SharePoint and OneDrive, Teams, security and identity in higher editions; Copilot as an add-on or in E7 | Suites without Teams in the EEA since 2023 and worldwide since April 2024; Teams Enterprise sold separately, $8.55 a user a month ([Microsoft 365 plans](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft365-plans-and-pricing)) | EU commitments binding since September 2025; UK SMS proposed decision October 16, 2026 |
| **Google Workspace** | Gmail, Calendar, Drive, Docs, Meet, Chat and, since January 2025, Gemini in Business and Enterprise plans ([Google Workspace blog](https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI)) | Editions only; Gemini no longer needed as an add-on | Reported inside Google Cloud; no Workspace-specific case in this chapter's sources |
| **Salesforce with Slack** | Slack alongside CRM and Agentforce; Slack reported in a combined line with the platform ([Salesforce 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1108524/000110852426000060/crm-20260131.htm)) | Slack sold on its own plans | Slack withdrew its EU complaint after the 2025 market test |
| **Atlassian** | Jira, Confluence, Jira Service Management, Loom and Rovo, sold separately and in collections, Rovo included in paid plans ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)) | Each product on its own | None |
| **Zoom Workplace** | Meetings and the other Workplace products, with AI features by plan ([Zoom: pricing](https://zoom.us/pricing)) | Products also sold separately | None |

Every vendor in the table bundles. What makes Microsoft's case different is the starting position: the Commission's preliminary finding was that Microsoft is dominant worldwide in "SaaS productivity applications for professional use" ([European Commission, IP/24/3446](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446)), and tying is an abuse only for a dominant firm. A smaller vendor's bundle is a pricing decision; a dominant vendor's bundle can be a legal question.

## Why Suites Win Procurement

A suite wins because it removes work from the buyer, and the buyer in a large organization is IT and procurement, not the users:

- **One contract and one vendor review.** Each new vendor needs a security review, a data processing addendum, a contract negotiation and an entry in the vendor risk register. A suite product skips all of them.
- **One identity and one admin console.** The suite's products share directory, SSO, conditional access, device management and admin roles, so turning on a product is a setting, not a project.
- **One compliance surface.** Retention, legal hold, eDiscovery, DLP, audit and sensitivity labels apply across the suite's products from one place; a standalone product has to be connected to each.
- **A marginal price near zero.** Once the suite is paid for, an included product costs nothing extra; the standalone alternative is a new line in the budget.
- **Integration by default.** Chat that opens the document in place, meetings on the calendar, files attached from the same store.

The standalone vendor's answer is a better product and integration into the suite. It works when users push for it (chat in its early years, design tools, issue tracking for engineers), and it works less well when the buyer is consolidating spend. [The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape#suites-against-best-of-breed) describes the contest per category; the antitrust question is whether the dominant suite's advantages come from the product or from its position.

## The Teams Case

The European case, in order, from the Commission's press releases and the parties' announcements:

| Date | Step |
| --- | --- |
| April 2019 | The start of the tying the Commission identified: "since at least April 2019" Teams was tied to Microsoft's core productivity applications ([IP/24/3446](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446)) |
| July 22, 2020 | Slack files a complaint, alleging Microsoft was "force installing it for millions, blocking its removal" ([Slack](https://slack.com/blog/news/slack-files-eu-competition-complaint-against-microsoft)) |
| July 20, 2023 | alfaview GmbH files a second complaint raising similar concerns ([IP/24/3446](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446)) |
| July 27, 2023 | The Commission opens a formal investigation on Slack's complaint |
| 2023 and 2024 | Microsoft starts offering some suites without Teams, first in the EEA and then worldwide from April 1, 2024, with a standalone Teams for new enterprise customers at $5.25 a user a month and suites without Teams from $7.75 to $54.75 ([TechCrunch](https://techcrunch.com/2024/04/01/microsoft-to-unbundle-office-and-teams-globally-following-years-long-criticism)) |
| June 25, 2024 | The Commission opens a second investigation on alfaview's complaint and sends a Statement of Objections covering both, finding preliminarily that Microsoft's changes "are insufficient" ([IP/24/3446](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446)) |
| May 16 to June 16, 2025 | Market test of Microsoft's proposed commitments |
| September 2025 | The Commission accepts amended commitments and makes them binding; Slack and alfaview withdraw their complaints ([IP/25/2048](https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2048)) |

The theory of harm, in the Statement of Objections: Microsoft "may have granted Teams a distribution advantage by not giving customers the choice whether or not to acquire access to Teams when they subscribe to their SaaS productivity applications," an advantage "further exacerbated by interoperability limitations between Teams' competitors and Microsoft's offerings" ([IP/24/3446](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446)). The concern was not only chat: the Commission also worried that the conduct defended Microsoft's "suite-centric model from competing suppliers of individual software."

The 2024 unbundling shows why the Commission didn't stop there. Taking Teams out of a suite and selling it separately can raise the price for a customer who wants both; an analyst note quoted at the time said that "For new customers, this equates to a pricing increase" ([TechCrunch](https://techcrunch.com/2024/04/01/microsoft-to-unbundle-office-and-teams-globally-following-years-long-criticism)). An unbundled suite only restores choice if the price difference is large enough to matter and discounts don't quietly favor the bundle.

## The Commitments

The commitments the Commission accepted, from its decision ([IP/25/2048](https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2048)):

- **Suites without Teams at a lower price.** Microsoft offers customers buying in the EEA versions of Office 365 and Microsoft 365 without Teams "at an appreciably lower price" than the corresponding suites with Teams. After the market test it increased the price difference between some suites with and without Teams, business suites included, "by 50%."
- **Symmetric discounts.** Microsoft won't offer discount rates on Teams or on suites with Teams higher than those on suites without Teams. A large customer's negotiated discount can't make the bundle cheaper by the back door.
- **Recurrent switching.** EEA customers get "recurrent opportunities to switch to suites without Teams," including customers on long-term licenses, and the suites without Teams can be deployed in datacenters worldwide.
- **Visible alternatives.** Microsoft websites that advertise an offer with a suite with Teams must also show the corresponding offer without Teams.
- **Interoperability.** Teams' competitors and certain third parties get "effective interoperability" with certain Microsoft products and services for specific functions, can embed the Office web applications (Word, Excel, PowerPoint) in their own products, and can integrate their products prominently in Microsoft's core productivity applications. Interoperability and data portability information must be published on Microsoft's developer-facing websites.
- **Data portability.** EEA customers can extract their Teams messaging data for use in competing products.
- **Duration and enforcement.** Seven years, and ten years for interoperability and data portability; a monitoring trustee oversees implementation, mediates disputes with third parties and reports to the Commission, with fast-track arbitration for disputes that persist. Breaking the commitments can bring a fine of up to 10% of worldwide annual turnover without the Commission having to prove an infringement, or periodic penalties of 5% of daily turnover.

Two things the decision is not. It is not a finding of infringement: commitments under Article 9 of Regulation 1/2003 close a case without concluding that the law was broken. And it is not limited to Europe in practice: the Commission "takes note that Microsoft has unilaterally decided to align its worldwide suites offers and pricing with these commitments" and to keep offering, and further discount, frontline suites without Teams ([IP/25/2048](https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2048)).

For a standalone vendor, the interoperability and portability commitments are the durable part. A chat product can embed the Office web editors and integrate into Outlook through published interfaces, and a customer leaving Teams can take its messages with it, which feeds directly into Migrations, Imports & Switching and the import tools there.

## The UK Case: Business Software and Copilot

The UK's Competition and Markets Authority reached the same products from a different direction. Its cloud services market investigation (final decision July 31, 2025) found concerns about Microsoft's software licensing on rival clouds, and in March 2026 the CMA announced it would open a strategic market status investigation into Microsoft's "business software ecosystem," instead of the cloud SMS investigations the market investigation had recommended ([Slaughter and May, April 2026](https://www.slaughterandmay.com/insights/new-insights/competition-and-regulatory-newsletter-cma-announces-actions-on-business-software-and-cloud-services/); [The UK: Market Investigation to SMS](/books/hosting-and-cloud/competition-cases#the-uk-market-investigation-to-sms) has the cloud history).

The investigation launched on May 14, 2026 under the Digital Markets, Competition and Consumers Act 2024 ([CMA case page](https://www.gov.uk/cma-cases/microsofts-business-software-ecosystem)). Its scope is productivity software, personal computer and server operating systems, database management systems and security software, and it asks whether "bundling of products, limits in interoperability or default settings can prevent customers switching," including "how AI competitors can integrate with Microsoft's business software" ([SCL, May 2026](https://www.scl.org/cma-launches-strategic-market-status-investigation-into-microsofts-business-software-ecosystem/)). On October 16, 2026 the CMA proposed to designate Microsoft with SMS. It found Microsoft has a strong position in each of the five areas it examined, that its strength "comes from the barriers customers face when switching," and that commercial practices and integration advantages create further barriers; it put Microsoft's business software at over a million UK businesses and public sector organizations, with around 20 million monthly users ([CMA, October 16, 2026](https://www.gov.uk/government/news/cma-takes-first-steps-to-ensure-choice-in-business-software)).

The CMA's roadmap of possible interventions, if Microsoft is designated, names three areas: whether customers can freely choose AI tools and "whether alternative AI providers have a level playing field to compete with Microsoft's Copilot," whether bundling and integration of Microsoft's security products limits choice, and whether customers can choose which cloud to deploy their licenses on ([CMA, October 16, 2026](https://www.gov.uk/government/news/cma-takes-first-steps-to-ensure-choice-in-business-software)). Consultation on the proposed decision closes on November 13, 2026, and the statutory deadline for the decision is February 13, 2027 ([CMA case page](https://www.gov.uk/cma-cases/microsofts-business-software-ecosystem)). Designation doesn't assume wrongdoing; it allows conduct requirements and pro-competition interventions afterward.

The UK case extends the Teams logic to AI. Where the EU case was about a chat product tied to a suite, the UK case asks the same question about an assistant built into the suite's documents, mail and meetings, and about the interfaces competing assistants need to reach the same data. AI Assistants Over Company Data and AI Agents, Connectors & MCP cover what those interfaces look like.

## Bundled AI

AI is the newest product bundled into suites, and the bundling arrived through pricing rather than tying. Google moved Gemini into its Business and Enterprise plans in January 2025: a Business Standard customer who had paid $32 a user a month with the Gemini Business add-on paid $14, "only $2 more than they were paying for Workspace without Gemini," with existing customers moved from March 17, 2025 or at renewal ([Google Workspace blog](https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI)). Atlassian made Rovo "available at no additional cost" on its paid editions ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)); Slack and Notion put AI features into their plans ([Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats#ai-pricing-from-add-on-to-plan)). Microsoft took the other path, keeping Microsoft 365 Copilot as a $30 add-on while creating the E7 suite at $99 that includes E5, Copilot, Agent 365 and the Entra Suite ([Microsoft 365 plans](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft365-plans-and-pricing)).

For an independent AI assistant, both paths are hard. A bundled assistant raises the price of every seat a little and sets the marginal price of the suite's assistant at zero, the same position Teams was in; an add-on inside a top suite gets sold with the suite's other products in one negotiation. The independent's leverage is access to data in other systems and the interfaces the suite exposes, which is why the CMA's roadmap names AI integration explicitly.

## What Bundling Does to Standalone Vendors

The evidence is in the filings, read cautiously because many things move growth. Zoom, the standalone meetings leader, grew 4.4% in fiscal 2026 and its Enterprise net dollar expansion rate was 98% ([Zoom 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm)); Dropbox, competing with OneDrive and Drive, shrank 1.1% in 2025 ([Dropbox 10-K 2025](https://www.sec.gov/Archives/edgar/data/1467623/000146762326000008/dbx-20251231.htm)). Slack, the complainant, sold itself to a larger company with its own suite ambitions in 2021 ([The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape#a-dated-timeline)). Categories the suites haven't closed grow fast: monday.com up 27%, Figma up 41% ([monday.com 20-F 2025](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm), [Figma 10-K 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm)).

The standalone vendor's playbook that follows:

- **Integrate deeply with the suite.** Identity from the suite's directory, files from its store, presence from its calendar, and an app inside its chat. A customer that can't leave the suite can still add a better product beside it.
- **Become a suite in a neighborhood.** Atlassian (work management, service management, docs, video, AI), Zoom (meetings, phone, chat, contact center) and Salesforce (CRM plus Slack) each built a smaller suite around a strong category.
- **Win on cross-company networks.** Shared channels and shared files with other organizations favor whoever the other side uses.
- **Use the interfaces the regulators forced open.** The Teams commitments' interoperability and data portability terms, and the EU Data Act's switching rules ([The EU Data Act](/books/hosting-and-cloud/egress-and-switching#the-eu-data-act)), make it cheaper to win a customer from a suite.

## Licensing Restrictions on Clouds

The other bundling question is where the suite's software can run. Microsoft's licensing terms distinguish "Listed Providers" (Microsoft, Alibaba, Amazon and Google), on whose servers licenses without mobility rights can't be redeployed, from other hosting providers; customers and rival clouds argued this made running Microsoft software on AWS or Google Cloud more expensive than on Azure. The Hosting & Cloud volume has the detail ([Microsoft and the Listed Providers](/books/hosting-and-cloud/licensing-disputes#microsoft-and-the-listed-providers)). The short version, as of October 2026: the European cloud providers' association CISPE settled its complaint with Microsoft in July 2024 ([Thurrott](https://www.thurrott.com/cloud/305327/microsoft-settles-with-cispe-on-cloud-licensing-issues-in-eu)); Google withdrew its own EU complaint in November 2025, citing the Commission's new cloud investigations ([Computing](https://www.computing.co.uk/news/2025/legislation-regulation/google-withdraws-antitrust-complaint-microsoft)); and the CMA's business software roadmap includes "whether customers have effective choice over which cloud to deploy their software licenses on" ([CMA, October 16, 2026](https://www.gov.uk/government/news/cma-takes-first-steps-to-ensure-choice-in-business-software)).

For a workplace vendor this matters in two ways. A customer that self-hosts parts of the stack (Exchange or SharePoint servers, or a desktop virtualization estate running Office) is affected by where it may run them. And the licensing case is the same argument as the Teams case in a different layer: a dominant position in one product used to steer the customer's choice in another.

## How to Build It

A suite that must sell its products both bundled and separately, keep the price difference visible, keep discounts symmetric and give customers windows to switch needs those rules in the catalog, not in a sales spreadsheet. This chapter extends `plans`, `plan_prices` ([Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats#how-to-build-it)) and `products` ([The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape#how-to-build-it)):

```sql
CREATE TABLE plan_products (             -- which products a plan includes, and where
  plan_id      UUID NOT NULL REFERENCES plans (id),
  product_id   UUID NOT NULL REFERENCES products (id),
  markets      TEXT[] NOT NULL DEFAULT '{}',   -- ISO country or region codes; empty: everywhere
  included_from DATE NOT NULL,
  included_until DATE,                    -- set when a product is unbundled from the plan
  PRIMARY KEY (plan_id, product_id, included_from)
);

CREATE TABLE plan_alternatives (         -- a bundle and its counterpart without one product
  plan_id             UUID NOT NULL REFERENCES plans (id),   -- the suite with the product
  without_plan_id     UUID NOT NULL REFERENCES plans (id),   -- the same suite without it
  removed_product_id  UUID NOT NULL REFERENCES products (id),
  min_price_gap       BIGINT NOT NULL CHECK (min_price_gap > 0),  -- per seat per month
  currency            CHAR(3) NOT NULL,
  markets             TEXT[] NOT NULL,
  obligation_ref      TEXT,               -- the commitment or policy that requires it
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (plan_id, without_plan_id, valid_during),
  CHECK (plan_id <> without_plan_id)
);

CREATE TABLE switch_windows (            -- when a customer may move to the alternative
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id   UUID NOT NULL REFERENCES subscriptions (id),
  from_plan_id      UUID NOT NULL REFERENCES plans (id),
  to_plan_id        UUID NOT NULL REFERENCES plans (id),
  opens_at          TIMESTAMPTZ NOT NULL,
  closes_at         TIMESTAMPTZ NOT NULL,
  notified_at       TIMESTAMPTZ,          -- when the customer was told
  exercised_at      TIMESTAMPTZ,
  CHECK (closes_at > opens_at)
);
```

Design notes:

- **The gap is checked, not trusted.** A nightly job compares the current `plan_prices` rows for each pair in `plan_alternatives` per market and currency and fails loudly if the gap falls below `min_price_gap`; a price change that would break it is rejected at insert.
- **Discount symmetry is a quote-time rule.** When a quote applies a discount rate to a suite with a product, the quoting service checks that the same rate is available on its alternative, and records the comparison with the quote. A trustee or a regulator asking for evidence gets rows, not assurances.
- **Show the alternative wherever the bundle is sold.** Storefront and quote templates read `plan_alternatives` to display the counterpart beside the bundle in markets where an obligation applies.
- **Windows are generated, dated and notified.** A job creates `switch_windows` at each anniversary or renewal for subscriptions in covered markets, notifies the customer, and records the outcome; long-term licenses get windows on the obligation's schedule, not only at term end.
- **Unbundling is a dated catalog change.** Ending a product's inclusion sets `included_until`, never deletes the row, so the bill for any past period can be explained.
- **Portability is an export, built once.** The data portability obligation is served by the same export path the customer uses to leave (Migrations, Imports & Switching and eDiscovery & Export), with a documented format.

## Auditing

- **What each plan included, where and when.** `plan_products` with dates and markets, so the bundle a customer bought can be reconstructed for any period.
- **Price gaps and discount comparisons.** Every gap check and every discount comparison at quote time, kept for the life of the obligation (seven or ten years in the Teams commitments).
- **Switching opportunities.** Every window offered, the notice sent and whether the customer took it.
- **Interfaces published.** Versions and dates of interoperability and data portability documentation, since publication is itself an obligation.

## What This Means for the System You Build

- **Model the bundle as data:** which products each plan includes, in which markets, from when to when.
- **Pair every regulated bundle with its alternative,** and enforce the minimum price gap in the catalog.
- **Check discount symmetry when quotes are made,** and keep the evidence.
- **Generate switching windows and notices** on the obligation's schedule.
- **Publish interoperability and export interfaces** as products with versions, not as favors to partners.
- **If you're the standalone vendor,** integrate with the suite's identity, files and calendar first, and build on the interfaces regulators opened.
- **Expect AI to be judged by the same tests** as chat: bundling, defaults, interoperability and switching.

## References

**Regulators and courts**

- [European Commission: Statement of Objections to Microsoft over Teams (IP/24/3446)](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3446), dominance in SaaS productivity applications, tying since at least April 2019, the distribution advantage, interoperability limitations, the alfaview complaint and the case numbers
- [European Commission: Commission accepts commitments offered by Microsoft (IP/25/2048)](https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2048), the commitments, the 50% gap increase, durations, the trustee, fines, worldwide alignment, the market test dates and the withdrawn complaints
- [CMA: Microsoft's business software ecosystem (case page)](https://www.gov.uk/cma-cases/microsofts-business-software-ecosystem), launch on May 14, 2026, the proposed decision, consultation close and the February 13, 2027 deadline
- [CMA: CMA takes first steps to ensure choice in business software (October 16, 2026)](https://www.gov.uk/government/news/cma-takes-first-steps-to-ensure-choice-in-business-software), the proposed designation, findings, users and organizations, and the roadmap areas

**Commentary and reporting**

- [Slaughter and May: CMA announces actions on business software and cloud services (April 2026)](https://www.slaughterandmay.com/insights/new-insights/competition-and-regulatory-newsletter-cma-announces-actions-on-business-software-and-cloud-services/), the March 2026 package and the shift from cloud to business software
- [SCL: CMA launches SMS investigation into Microsoft's business software ecosystem (May 2026)](https://www.scl.org/cma-launches-strategic-market-status-investigation-into-microsofts-business-software-ecosystem/), the investigation's scope and questions
- [TechCrunch: Microsoft to unbundle Office and Teams globally (April 1, 2024)](https://techcrunch.com/2024/04/01/microsoft-to-unbundle-office-and-teams-globally-following-years-long-criticism), standalone Teams and suites-without-Teams prices and the pricing-increase analysis
- [Thurrott: Microsoft settles with CISPE on cloud licensing issues in EU (July 2024)](https://www.thurrott.com/cloud/305327/microsoft-settles-with-cispe-on-cloud-licensing-issues-in-eu), the CISPE settlement
- [Computing: Google withdraws EU antitrust complaint against Microsoft (November 2025)](https://www.computing.co.uk/news/2025/legislation-regulation/google-withdraws-antitrust-complaint-microsoft), the withdrawal and the Commission's cloud investigations

**Companies**

- [Slack: Slack files EU competition complaint against Microsoft](https://slack.com/blog/news/slack-files-eu-competition-complaint-against-microsoft), the July 22, 2020 complaint and its allegations
- [Microsoft 365 Enterprise: plans and pricing](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft365-plans-and-pricing), Teams Enterprise, E7 and the Copilot add-on
- [Google Workspace blog: AI included in Business and Enterprise plans (January 2025)](https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI), Gemini bundling and the price comparison
- [Zoom: Pricing](https://zoom.us/pricing), Zoom Workplace plans
- [Salesforce: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1108524/000110852426000060/crm-20260131.htm), Slack's reporting line
- [Atlassian: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm), Rovo at no additional cost
- [Zoom Communications: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), growth and net dollar expansion rate
- [Dropbox: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1467623/000146762326000008/dbx-20251231.htm), revenue change
- [monday.com: Form 20-F for 2025](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm), revenue growth
- [Figma: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm), revenue growth
