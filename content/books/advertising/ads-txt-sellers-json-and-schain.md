+++
title = "ads.txt, sellers.json & SupplyChain"
nav_title = "ads.txt & SupplyChain"
description = "ads.txt 1.1 and app-ads.txt, sellers.json, the SupplyChain object and schain 1.1, the checks a DSP runs, buyers.json and DemandChain, and where ads.cert stands."
category = "Advertising Industry"
order = 2920
part = "Programmatic"
tags = ["advertising", "ad-tech", "programmatic", "supply-chain", "ads-txt", "data-model"]
+++

Programmatic buying works on claims. A bid request says it is for an ad on a news site and that it comes from a given seller account at a given exchange, and the buyer has milliseconds to decide whether to believe it. Three IAB Tech Lab standards let the buyer check the claim against files the parties publish themselves. **ads.txt** (and **app-ads.txt** for apps) is a text file a publisher posts on its own domain listing every exchange account authorized to sell its inventory. **sellers.json** is a file each exchange posts listing every seller account it has, with the company behind it and whether that company is the publisher or an intermediary. The **SupplyChain object** (`schain`) travels inside the bid request and lists every company that handled the request on its way from the publisher to the bidder. A request is credible when the three agree: the publisher's file authorizes each seller in the chain, each exchange's file names each seller, and the chain is complete back to the publisher.

They are hard because each file is crawled from someone else's server on someone else's schedule, written by hand or by tools that disagree on details, and the checks only work if every party fills in the same identifiers in the same way. A publisher that forgets one line in ads.txt loses every bid from buyers who enforce it; an exchange that lists a reseller as `PUBLISHER` in sellers.json makes resold inventory look direct; a chain that leaves out a header bidding wrapper or a sales house is still marked complete under the old version of the object. And they are only as strong as the HTTP fetch that retrieves them: the specification itself says ads.txt declarations are "retrieved and applied in separate, possibly unauthenticated HTTP transactions".

This chapter covers ads.txt from 1.0 to 1.1 (records, the CONTACT, SUBDOMAIN, INVENTORYPARTNERDOMAIN, OWNERDOMAIN and MANAGERDOMAIN variables, and the crawling rules), app-ads.txt, sellers.json, the SupplyChain object from 1.0 to the 1.1 update in OpenRTB 2.6-202611, the validation a DSP runs on each request, buyers.json and the DemandChain object, and the status of ads.cert. It extends `properties` and `seller_accounts` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), which already describes a seller account as "the sellers.json row" and a property's ads.txt as the list of seller accounts allowed to sell it. [How Programmatic Works](/books/advertising/how-programmatic-works) covers where the checks sit in the request lifecycle; [OpenRTB](/books/advertising/openrtb) owns the `source` object around `schain`; [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges) owns how an exchange onboards sellers and publishes its sellers.json; [Demand-Side Platforms](/books/advertising/demand-side-platforms) owns supply path optimization and the DSP's `supply_sources`; [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality) covers the studies of intermediaries and made-for-advertising sites; [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud) covers spoofing and the schemes these files were invented to stop; and [In-App Advertising & Mediation](/books/advertising/in-app-advertising) and [Connected TV & Streaming](/books/advertising/connected-tv) cover the app and CTV inventory that app-ads.txt and INVENTORYPARTNERDOMAIN were added for.

## How the Platforms Do It

As of November 2026, the standards and their status, from IAB Tech Lab's pages and repositories:

| Standard | Version and date | Published by | Read by | Status |
| --- | --- | --- | --- | --- |
| **ads.cert** | 2.0 (Call Signs and Authenticated Connections); the supply chain page lists "Authenticated Connections v1", January 2022 | Ad systems, as DNS records and signed requests | Counterparties of a server-to-server call | Authenticated Connections "ready for adoption"; Authenticated Delivery and Authenticated Devices "future" |
| **ads.txt** | 1.1, final July 2022 (the Tech Lab page says August 2022) | Publishers, at `/ads.txt` on the root domain | Exchanges, DSPs, verification vendors | Current; no breaking changes since 2017 |
| **app-ads.txt** | 1.0 final | App developers, at `/app-ads.txt` on the developer domain from the store listing | As ads.txt, via the store listing | Current |
| **buyers.json and DemandChain** | 1.0, June 2021 | Buying systems and intermediaries | Publishers and SSPs | Published; Tech Lab "still welcome[s] feedback" |
| **sellers.json** | 1.0, July 2019 (finalized July 31, 2019) | Exchanges and SSPs, at `/sellers.json` | DSPs, verification vendors | Current |
| **SupplyChain object** | 1.1 in OpenRTB 2.6-202611 (November 18, 2026); 1.0 as a standalone document | Each system that handles a bid request appends a node | Bidders | 1.1 adds `complete` values for payment and non-payment nodes |

And how the platforms whose public documentation describes these checks use them:

| Platform | Role | What it does |
| --- | --- | --- |
| **Display & Video 360** | DSP | Checks that "every seller, including intermediaries, identified in the SupplyChain object" is authorized by the publisher's ads.txt or app-ads.txt and blocks bidding on unauthorized inventory; an empty SupplyChain object counts as unauthorized; buyers choose "Authorized Direct Sellers only", "Authorized Direct Sellers and Resellers" (which the page calls the default for new campaigns, though another section gives direct sellers only as the default) or to include non-participating publishers "at your own risk" |
| **Google Ad Manager** | Publisher ad server and exchange | Generates ads.txt lines for Google seller accounts only; crawls ads.txt every 24 hours; builds the SupplyChain object in its bid requests, adding a `google.com` node and accepting upstream nodes from payment intermediaries and Open Bidding exchanges, while leaving out non-payment intermediaries: client-side header bidding, non-payment header bidding, inventory sharing and other mediation |
| **IAB Tech Lab tools** | Reference implementations | An open-source prototype crawler (suitable only for "a very modest production usage"), an ads.txt parser, and an ads.txt aggregator service with structured data files |
| **Prebid.js** | Header bidding wrapper | Lets the publisher configure a SupplyChain object globally or per bidder; since Prebid 10 it is first-party data at `ortb2.source.schain`, and a bidder-specific chain is appended after the global nodes |

Three patterns:

- **The buyer enforces, the seller declares.** Every standard here is a declaration by the party that knows the fact (the publisher knows who it authorized; the exchange knows who it pays) and a check by the party that pays. A file that nobody checks does nothing, which is why the MRC's auction transparency standards require DSPs to do the checks rather than leave them optional.
- **Payment defines the chain.** sellers.json lists who an exchange pays, ads.txt's `DIRECT` means the publisher controls the account, and until schain 1.1 a SupplyChain node meant "this system pays the next one". Google's documentation states the consequence: non-payment intermediaries, including client-side header bidding, are not in its chains. Version 1.1 lets them be added as `hp = 0` nodes without breaking the payment chain.
- **Strictness is the buyer's setting.** Display & Video 360 offers three levels (direct sellers only, direct and resellers, or also non-participating publishers), and Google's own MCM documentation warns that an "unauthorized" status "doesn't necessarily mean that Demand Side Platforms (DSPs) will reject requests" because "validation differs across DSPs". The standards define the data; each buyer decides how much mismatch it tolerates.

## ads.txt

ads.txt ("Authorized Digital Sellers") was developed in spring 2017 and modeled on robots.txt: "the file is posted to the web serving system of the content, thus proving that the website authored the file." It lets a publisher declare which advertising systems, and which accounts in them, may sell its inventory, so that a seller claiming to sell a premium site's inventory from an account the site never authorized can be refused.

**Versions.** From the 1.1 specification's change log:

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | June 27, 2017 | First version |
| 1.0.1 | August 30, 2017 | Clarifications; the `contact` and `subdomain` variables |
| 1.0.2 | March 4, 2019 | The placeholder record for a file with no authorized sellers, deprecating the empty file; app-ads.txt differentiated |
| 1.0.3 | Public comment December 2020, final March 2021 | `inventorypartnerdomain`, for CTV and similar cases |
| 1.1 | Public comment April 2022, final July 2022 | `managerdomain` and `ownerdomain` |

**Records.** Each data line is `<FIELD #1>, <FIELD #2>, <FIELD #3>, <FIELD #4>`:

1. **Domain name of the advertising system**: "The canonical domain name of the SSP, Exchange, Header Wrapper, etc system that bidders connect to", ideally as the exchange documents it; for a parent company running several exchanges, the domain of the RTB connection the bidder receives requests from.
2. **Publisher's account ID**: "the same value used in transactions (i.e. OpenRTB bid requests)", typically `publisher.id` in OpenRTB.
3. **Type of account or relationship**: `DIRECT` means "the Publisher (content owner) directly controls the account"; `RESELLER` means "the Publisher has authorized another entity to control the account... and resell their ad space". Case insensitive.
4. **Certification authority ID** (optional): the advertising system's ID at a certification authority such as TAG; superseded by the identifiers in sellers.json and possibly deprecated in a future version.

Lines starting with `#` are comments, and anything after a `#` on a line is ignored. Whitespace is ignored, fields must not contain tabs, commas or whitespace (otherwise URL-encoded), records are separated by any end-of-line convention, and extension data follows a `;` separator. "If the data is obviously corrupted or malformed the contents of the file should be ignored."

**Variables.** Lines of the form `<VARIABLE>=<VALUE>` are stored against the root domain; multiple lines with the same variable are all kept:

| Variable | Meaning | Rule |
| --- | --- | --- |
| `CONTACT` | Human-readable contact for the file's owner | Optional |
| `SUBDOMAIN` | A subdomain with its own ads.txt | Only root domains refer to subdomains; subdomains don't refer onward |
| `INVENTORYPARTNERDOMAIN` | The domain of a partner authorized to monetize inventory in this app or site, whose ads.txt lists its sellers | Recommended where relevant; follow to an ads.txt only, one hop; applies only when the request carries `site.inventorypartnerdomain` or `app.inventorypartnerdomain` |
| `OWNERDOMAIN` | The business domain of the entity that owns the site or app | Recommended in every file; "the same value as the sellers.domain in this Publisher's entries" in sellers.json; only the first instance counts; if absent, the domain where the file was found |
| `MANAGERDOMAIN` | The business domain of "a primary or exclusive monetization partner", optionally with an ISO 3166-1 alpha-2 country | Optional; only for a seller that is not the publisher but is its primary or exclusive programmatic seller; one per country, a global default without a country |

A file for a publisher that owns several sites and uses a sales house in France:

```text
# ads.txt for example.com
OWNERDOMAIN=mediacompany.com
MANAGERDOMAIN=salesbureau.fr, FR
CONTACT=adops@mediacompany.com
greenadexchange.com, 12345, DIRECT, d75815a79
blueadexchange.com, XF436, DIRECT
silverssp.com, 9675, RESELLER, f496211
orangeexchange.com, 45678, RESELLER
subdomain=video.example.com
```

A publisher that authorizes nobody posts the placeholder record `placeholder.example.com, placeholder, DIRECT, placeholder`, because an empty file is indistinguishable from a server's error page; consuming systems were told to ignore the empty-file method after March 1, 2020.

OWNERDOMAIN and MANAGERDOMAIN tie ads.txt to the other two standards: in a complete SupplyChain object, the first node (the originating publisher) should have a sellers.json `domain` matching OWNERDOMAIN, and for inventory a manager monetizes, the MANAGERDOMAIN is expected to be the domain of that first node. The specification recommends that buyers require sellers listed as `BOTH` in sellers.json to declare OWNERDOMAIN correctly in every ads.txt they own or represent. The MRC's January 2026 standard goes further for OpenRTB auctions: DSP support for ads.txt 1.1 is required, and "the MANAGERDOMAIN variable are required to be used to represent a publisher's relationship with the primary or exclusive monetization partner."

## Crawling ads.txt

The specification's access rules, which every crawler has to implement the same way for the files to mean the same thing:

- **Where.** `/ads.txt` on the root domain, defined as the public suffix plus one label (crawlers use the Public Suffix List), and on subdomains only when the root file declares them with `subdomain=`. A subdomain declared with its own file is governed only by that file; otherwise the root file governs it.
- **Protocol and type.** HTTP and/or HTTPS, preferring HTTPS when both answer; `Content-Type: text/plain` (optionally with `charset=utf-8`), and "all other Content-types should be treated as an error and the content ignored".
- **Status codes.** 2xx: parse and use. 301, 302 or 307 within the original root domain: follow, any number of times. Only one redirect outside the root domain is allowed, for delegation to a third party's server; a further redirect from there is an error. 401: contact the site. 404: "no declarations exist", so the crawler can treat no seller as unauthorized on that basis. Any other error on a URL that previously returned data: keep using the last good copy.
- **Caching.** Honor HTTP cache headers; "If no cache-control directives are present consuming systems should default to an expiry of 7 days."
- **Change detection.** The specification declines to add a last-updated variable and recommends the `Last-Modified` header plus a checksum of the content.

Google's crawler is one implementation of these rules, documented for Ad Manager publishers: it "Attempts to crawl the file every 24 hours", follows only one redirect outside the root domain, crawls `www.domain.com/ads.txt` only if `domain.com/ads.txt` redirects to it, may skip a file that robots.txt disallows for its user agents, ignores any response other than 200, purges entries on a hard 404, retains entries "for up to five days" on a soft 404 or a 500, and tells publishers to allow 24 to 48 hours after a requested recrawl. A 7-day default expiry in the specification and a daily crawl at Google are both compliant; a crawler's freshness is the crawler's choice, and a publisher adding a seller should expect buyers to see it on their own schedules.

My rule for a crawler is the general one for scheduled ingestion of someone else's data: fetch on a schedule with jitter, keep every fetch's result and content hash, never overwrite the last good copy with an error, and alert on files that disappear rather than on files that didn't change ([Scheduling](/docs/architecture/background-jobs#scheduling), [Quality and Freshness](/docs/data/data-pipelines#quality-and-freshness)). A missing file is a fact with a timestamp, kept as such ([Negative Caching](/docs/architecture/application-caching#negative-caching)).

## app-ads.txt

Apps don't have a domain the bid request can name, so app-ads.txt starts from the app store. The specification's discovery steps: take the developer website URL from the app's store listing; keep the host name's first label before the public suffix, and the second if present ("another.subdomain.example.com" becomes "subdomain.example.com"); remove a leading "www." or "m."; append `/app-ads.txt`; try HTTPS, fall back to HTTP; and if a subdomain has no file, check the parent domain. Stores are asked to publish the developer URL, bundle ID and store ID as meta tags in the listing page (`appstore:developer_url`, `appstore:bundle_id`, `appstore:store_id`).

On the request side, SSPs and exchanges must send `storeurl` in bid requests ("Any supply-side platform or exchange not currently providing this value must do so"); verifiers read the store URL, crawl the listing, take the canonical bundle or store ID from its meta tags, and index by store domain plus ID (the specification's example is "itunes.apple.com:343200656 => rovio.com") rather than by the full store URL, which has "potentially unlimited variants". Crawlers should visit each unique store URL no more than weekly, honor the store's robots.txt, crawl only listings for apps they actually receive impressions for, and expect a developer changing domains to keep the file on both for about 30 days. The `subdomain` directive is unused in app-ads.txt. Otherwise enforcement is "nearly identical" to web ads.txt, and the file format is the same. Google's guidance for app publishers adds one practical rule: the app-ads.txt file must not be on a subdomain.

**CTV and inventory partners.** A streaming app often carries inventory owned by the programmers whose content it licenses, each with its own sellers. Before 1.0.3, the app's file had to repeat every partner's seller lines; with INVENTORYPARTNERDOMAIN, the app's app-ads.txt points at the partner's domain, and the crawler fetches the partner's ads.txt (not app-ads.txt), one hop only, ignoring any further INVENTORYPARTNERDOMAIN entries there. The authorization applies only when the bid request names the partner in `app.inventorypartnerdomain`. [Connected TV & Streaming](/books/advertising/connected-tv) covers who owns which ad breaks.

## sellers.json

sellers.json is the exchange's side. The specifications were finalized for adoption on July 31, 2019, and the file lives at `/sellers.json` on the advertising system's root domain, served as `application/json`, with the same one-external-redirect rule and 7-day default expiry as ads.txt. The top level has a required `version` ("currently the only valid value is 1.0") and `sellers` array ("All sellers must be included even if they are confidential"), and optional `identifiers` (TAG-ID, DUNS), `contact_email`, `contact_address` and `ext`. Each seller:

| Field | Required | Meaning |
| --- | --- | --- |
| `seller_id` | Yes | "the same ID that appears in an ads.txt file and in the SupplyChain.nodes array sid property" |
| `seller_type` | Yes | `PUBLISHER` (the inventory is on a medium the entity owns and the system pays it directly), `INTERMEDIARY` (not owned, or not paid directly), or `BOTH`; case insensitive |
| `is_confidential` | No, default 0 | 1 when the seller's identity is confidential |
| `name` | When not confidential | The legal entity paid |
| `domain` | When the seller has a web presence and is not confidential | A root domain, not a URL; for an intermediary, the root domain of its own sellers.json |
| `is_passthrough` | No, default 0 | 1 when the seller has an account control relationship with the downstream system |
| `comment`, `ext` | No | Free text and extensions |

Two identity rules make the file usable: "It is invalid for a seller_id to represent multiple entities", and "It is valid for a selling entity to have multiple seller_ids within an advertising system." OpenRTB 2.6 says the same from the request's side: the publisher ID in a bid request "Corresponds to a `seller_id` of a seller in the exchange's sellers.json file", and "Every ID must map to only a single entity that is paid for inventory transacted via that ID."

```json
{
  "version": "1.0",
  "contact_email": "sellers@greenadexchange.com",
  "identifiers": [{ "name": "TAG-ID", "value": "d75815a79" }],
  "sellers": [
    { "seller_id": "12345", "seller_type": "PUBLISHER", "name": "Media Company, Inc.",
      "domain": "mediacompany.com" },
    { "seller_id": "88710", "seller_type": "INTERMEDIARY", "name": "Silver SSP Ltd",
      "domain": "silverssp.com" },
    { "seller_id": "90021", "seller_type": "PUBLISHER", "is_confidential": 1 }
  ]
}
```

In this volume's model, an exchange's own `seller_accounts` rows are what it publishes as sellers.json, and the crawled sellers.json files of other exchanges are observations of their seller accounts, kept separately and linked when they match.

## The SupplyChain Object

ads.txt says who may sell; sellers.json says who each seller is; the SupplyChain object says who actually handled this request. It is "Chain of nodes from beginning to end representing the entities that took custody of a bid request", carried in OpenRTB 2.6 as `source.schain` (recommended), having moved there from `source.ext.schain`.

```json
{
  "source": {
    "tid": "2a7c1b5e-6f0d-4b0e-9a21-4e8c0d1f9b33",
    "schain": {
      "ver": "1.1",
      "complete": 1,
      "nodes": [
        { "asi": "greenadexchange.com", "sid": "12345", "hp": 1, "rid": "req-1" },
        { "asi": "silverssp.com", "sid": "ABE679", "hp": 1, "rid": "req-2" }
      ]
    }
  }
}
```

The fields, from OpenRTB 2.6 as updated to schain 1.1:

- **`ver`**: "major.minor", e.g. `"1.1"`.
- **`complete`**: `0` "not complete"; `1` "payment complete; the SupplyChain object was created by the initial advertising system" and "includes all hp=1 nodes; some or all hp=0 nodes may be missing"; `2` "payment and non-payment complete; the SupplyChain object includes all hp=1 nodes and all hp=0 nodes".
- **`nodes`**: "appended in supply-chain order from seller to buyer"; the first is the originating party, the last the system sending this request.
- **`asi`**: "The canonical domain name of the SSP, Exchange, Header Wrapper, etc system that bidders connect to", the same value as ads.txt field #1.
- **`sid`**: the seller or reseller account in that system, "limited to 64 characters", the same value as ads.txt field #2 and the sellers.json `seller_id`.
- **`rid`**: the OpenRTB request ID as this seller issued it.
- **`name`, `domain`**: optional, and "should NOT be included if it exists in the advertising system's sellers.json file".
- **`hp`**: "When set to 1, the advertising system in the asi field pays the seller in the sid field"; "When set to 0, this node is not involved in the flow of payment for the inventory."

In version 1.0 every node was a payment node and `complete` was 0 or 1, so a wrapper or sales house that touched the request without paying anyone had no place in it; Google's documentation describes its chains in exactly those terms, excluding non-payment intermediaries: "client-side header bidding, non-payment header bidding, inventory sharing, and other mediation". Version 1.1, released in OpenRTB 2.6-202611 on November 18, 2026, keeps `complete = 1` as payment complete (every `hp = 1` node present) and adds `complete = 2` for chains that also list every non-payment node. IAB Tech Lab's supply chain page lists the SupplyChain object at v1.1 in a row it shares with ads.txt and sellers.json, dated August 2022, while the standalone object document still shows 1.0; the OpenRTB release is where the 1.1 text is. A bidder should accept `ver` 1.0 and 1.1 and read `complete` by version: a 1.0 `complete = 1` means what 1.1 calls payment complete.

Each system that forwards a request appends its own node and passes the chain on; it never rewrites earlier nodes. Prebid.js lets the publisher set the first part of the chain (since Prebid 10 as first-party data at `ortb2.source.schain`, with a bidder-specific chain appended after the global nodes). Google documents its node layouts by scenario: one `google.com` node for direct sales through Ad Manager, AdMob or AdSense; two nodes for Open Bidding (Google's `google.com` node first, then the Open Bidding exchange's, which it adds before passing the request on); and for its Multiple Customer Management program, one or two nodes depending on whether the parent manages the child's account or only its inventory. Its comma-delimited `schain` parameter serializes the object as `ver,complete` and nodes as `asi,sid,hp,rid,name,domain,ext`, URL-encoding values that need it.

## What a DSP Checks

The MRC's Digital Advertising Auction Transparency Standards (final, January 2026) require, for OpenRTB auctions, that "both the SupplyChain object and SupplyChainNode object (including the RequestId) are required to be used to their fullest extent and be complete", and that DSPs do three things: "Validate seller ids declared in ads.txt files with what should be the corresponding ids in the SSPs sellers.json files", "Ensure that the supply chain ends at the owner of the inventory", and "Provide buyers with fully transparent reporting on the average number of nodes (also known as hops) and mis- or undeclared supply chains". Display & Video 360 checks every seller in the chain, intermediaries included, against the publisher's ads.txt or app-ads.txt, and treats an empty chain as unauthorized. Putting the standards together, the check a DSP runs on each request, against cached copies of the files:

1. **Resolve the property's file.** For a site, `site.domain` reduced to its root domain (and the declared subdomain's file where one exists); for an app, the developer domain from the store listing named by `storeurl`, then its app-ads.txt; plus the partner's ads.txt when `inventorypartnerdomain` is present. No file is "non-participating", a separate decision from "unauthorized".
2. **Read the chain.** Require `source.schain`; record `ver`, `complete` and the node count. An absent or empty chain fails.
3. **Check the last node against the request.** The last node's `asi` is the exchange the request came from and its `sid` is the request's `publisher.id`.
4. **Check every payment node against ads.txt.** For each node with `hp = 1`, the property's file has a line with that `asi` and `sid`. The first node's line should be `DIRECT` (the publisher controls the account), or the node's domain should be the declared MANAGERDOMAIN; later nodes are normally `RESELLER` lines.
5. **Check every payment node against sellers.json.** The `asi` system's sellers.json has a seller with that `seller_id`; the first node's seller is `PUBLISHER` or `BOTH`, intermediaries are `INTERMEDIARY` or `BOTH`; a confidential seller passes identity checks only as far as the buyer's policy allows.
6. **Check the owner.** The first node's sellers.json `domain` matches the property's OWNERDOMAIN (or the domain the file was found on, when OWNERDOMAIN is absent).
7. **Score the path.** Count the hops, note non-payment nodes under 1.1, and pass the result to supply path selection ([Demand-Side Platforms](/books/advertising/demand-side-platforms)) and to reporting.

The parsing and the core of the check are small enough to show. This sketch parses ads.txt lines into records and variables and checks one chain's payment nodes against a parsed file and a sellers.json lookup:

```go tab="Go"
package supply

import "strings"

type Record struct {
	ASI, SellerID, Relationship, CertID string
}

type File struct {
	Records   []Record
	Variables map[string][]string // upper-cased name -> values, in file order
}

// Parse reads ads.txt or app-ads.txt content. Malformed lines are skipped;
// a caller that wants "obviously corrupted" files rejected counts them.
func Parse(body string) (File, int) {
	f := File{Variables: map[string][]string{}}
	bad := 0
	for _, line := range strings.FieldsFunc(body, func(r rune) bool { return r == '\n' || r == '\r' }) {
		if i := strings.IndexByte(line, '#'); i >= 0 {
			line = line[:i]
		}
		if i := strings.IndexByte(line, ';'); i >= 0 { // extension fields
			line = line[:i]
		}
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		if i := strings.IndexByte(line, '='); i > 0 && !strings.Contains(line[:i], ",") {
			name := strings.ToUpper(strings.TrimSpace(line[:i]))
			f.Variables[name] = append(f.Variables[name], strings.TrimSpace(line[i+1:]))
			continue
		}
		parts := strings.Split(line, ",")
		if len(parts) < 3 {
			bad++
			continue
		}
		for i := range parts {
			parts[i] = strings.TrimSpace(parts[i])
		}
		rel := strings.ToUpper(parts[2])
		if rel != "DIRECT" && rel != "RESELLER" {
			bad++
			continue
		}
		r := Record{ASI: strings.ToLower(parts[0]), SellerID: parts[1], Relationship: rel}
		if len(parts) > 3 {
			r.CertID = parts[3]
		}
		f.Records = append(f.Records, r)
	}
	return f, bad
}

type Node struct {
	ASI, SID string
	HP       int
}

type Seller struct{ Type, Domain string }

// SellerLookup finds a seller_id in the sellers.json of the system at asi.
type SellerLookup func(asi, sid string) (Seller, bool)

// CheckChain returns the index of the first failing payment node and a
// reason, or -1 and "" when every payment node is authorized and declared.
func CheckChain(f File, nodes []Node, sellers SellerLookup) (int, string) {
	if len(nodes) == 0 {
		return 0, "empty_chain"
	}
	authorized := map[[2]string]string{}
	for _, r := range f.Records {
		authorized[[2]string{r.ASI, r.SellerID}] = r.Relationship
	}
	owner := ""
	if v := f.Variables["OWNERDOMAIN"]; len(v) > 0 {
		owner = strings.ToLower(v[0]) // only the first instance counts
	}
	for i, n := range nodes {
		if n.HP != 1 {
			continue // non-payment nodes (schain 1.1) are reported, not authorized
		}
		asi := strings.ToLower(n.ASI)
		if _, ok := authorized[[2]string{asi, n.SID}]; !ok {
			return i, "not_in_ads_txt"
		}
		s, ok := sellers(asi, n.SID)
		if !ok {
			return i, "not_in_sellers_json"
		}
		first := i == 0
		if first && strings.EqualFold(s.Type, "INTERMEDIARY") { // seller_type is case insensitive
			return i, "first_node_not_publisher"
		}
		if first && owner != "" && s.Domain != "" && !strings.EqualFold(s.Domain, owner) {
			return i, "owner_domain_mismatch"
		}
	}
	return -1, ""
}
```

```rust tab="Rust"
use std::collections::HashMap;

pub struct Record {
    pub asi: String,
    pub seller_id: String,
    pub relationship: String,
    pub cert_id: Option<String>,
}

#[derive(Default)]
pub struct File {
    pub records: Vec<Record>,
    pub variables: HashMap<String, Vec<String>>, // upper-cased name -> values, in file order
}

/// Reads ads.txt or app-ads.txt content. Malformed lines are skipped and
/// counted, so a caller can reject an "obviously corrupted" file.
pub fn parse(body: &str) -> (File, usize) {
    let mut f = File::default();
    let mut bad = 0;
    for raw in body.split(|c| c == '\n' || c == '\r') {
        let line = raw.split('#').next().unwrap_or("");
        let line = line.split(';').next().unwrap_or("").trim(); // drop extension fields
        if line.is_empty() {
            continue;
        }
        if let Some((name, value)) = line.split_once('=') {
            if !name.is_empty() && !name.contains(',') {
                f.variables
                    .entry(name.trim().to_uppercase())
                    .or_default()
                    .push(value.trim().to_string());
                continue;
            }
        }
        let parts: Vec<&str> = line.split(',').map(str::trim).collect();
        if parts.len() < 3 {
            bad += 1;
            continue;
        }
        let rel = parts[2].to_uppercase();
        if rel != "DIRECT" && rel != "RESELLER" {
            bad += 1;
            continue;
        }
        f.records.push(Record {
            asi: parts[0].to_lowercase(),
            seller_id: parts[1].to_string(),
            relationship: rel,
            cert_id: parts.get(3).map(|s| s.to_string()),
        });
    }
    (f, bad)
}

pub struct Node {
    pub asi: String,
    pub sid: String,
    pub hp: u8,
}

pub struct Seller {
    pub seller_type: String,
    pub domain: Option<String>,
}

/// Returns the index of the first failing payment node and a reason,
/// or None when every payment node is authorized and declared.
pub fn check_chain(
    f: &File,
    nodes: &[Node],
    sellers: impl Fn(&str, &str) -> Option<Seller>,
) -> Option<(usize, &'static str)> {
    if nodes.is_empty() {
        return Some((0, "empty_chain"));
    }
    let authorized: HashMap<(&str, &str), &str> = f
        .records
        .iter()
        .map(|r| ((r.asi.as_str(), r.seller_id.as_str()), r.relationship.as_str()))
        .collect();
    let owner = f
        .variables
        .get("OWNERDOMAIN")
        .and_then(|v| v.first()) // only the first instance counts
        .map(|s| s.to_lowercase());
    for (i, n) in nodes.iter().enumerate() {
        if n.hp != 1 {
            continue; // non-payment nodes (schain 1.1) are reported, not authorized
        }
        let asi = n.asi.to_lowercase();
        if !authorized.contains_key(&(asi.as_str(), n.sid.as_str())) {
            return Some((i, "not_in_ads_txt"));
        }
        let Some(s) = sellers(&asi, &n.sid) else {
            return Some((i, "not_in_sellers_json"));
        };
        if i == 0 && s.seller_type.eq_ignore_ascii_case("INTERMEDIARY") { // case insensitive
            return Some((i, "first_node_not_publisher"));
        }
        if i == 0 {
            if let (Some(o), Some(d)) = (&owner, &s.domain) {
                if !d.eq_ignore_ascii_case(o) {
                    return Some((i, "owner_domain_mismatch"));
                }
            }
        }
    }
    None
}
```

The sketch leaves out what a production check adds: the root-domain and subdomain resolution, the app store lookup, INVENTORYPARTNERDOMAIN's one hop, MANAGERDOMAIN by country, the DIRECT-versus-RESELLER policy per node, case rules for seller IDs (the specification makes the relationship field case insensitive, not the account ID), and confidential sellers. It runs on the bid path against files already in memory; the crawl and parse happen offline, and a request is never held for a fetch.

## buyers.json and the DemandChain Object

The same idea in the other direction. buyers.json is a public declaration mechanism for advertising systems and intermediaries "between payor and publisher" to disclose which buyers they represent, and the DemandChain object lets sellers see "all parties who are involved in buying the creative" in a bid response, for OpenRTB 2.x or 3.0. Both are version 1.0, released June 2021 with an implementation guide; IAB Tech Lab's page (last updated January 15, 2024) makes no statement about adoption and says it "still welcome[s] feedback". Their use is malvertising tracing: when a bad creative appears, a publisher or SSP can follow the buy side back to the seat that bought it. I found no public figure for how many buying platforms publish a buyers.json or send a DemandChain object. <!-- source-gap: adv-buyers-json-adoption | status | adoption of buyers.json and the DemandChain object by DSPs | closes with: an IAB Tech Lab or crawler-based adoption count for buyers.json or dchain in bid responses | checked: 2026-11-22 --> For the data model, a crawled buyers.json is the mirror of a crawled sellers.json: observations of another system's buyer seats, linked to this system's `buyer_seats` when they match.

## ads.cert

ads.txt and sellers.json authenticate the parties' declarations only as far as HTTP does; ads.cert is IAB Tech Lab's attempt to add cryptography. The first version (2018) focused on signing OpenRTB 3.0 bid requests; ads.cert 2.0 is "a complete departure" from it, with two protocols available: **Call Signs**, which publish public keys and business metadata in DNS records so participants can identify each other without a central authority, and **Authenticated Connections**, which signs server-to-server HTTP requests (bid requests or impression pings) so the receiver can verify the sender and detect tampering. Authenticated Delivery (bid request authentication) and Authenticated Devices (device attestation) are listed as future work, and the name is kept for a planned "Signed Bid Requests" protocol. Open-source implementations are in Go. The page was last updated February 14, 2024, and the supply chain foundations page lists "Authenticated Connections v1" from January 2022. OpenRTB 3.0, which defined signing fields marked beta, is not the protocol the industry ships; OpenRTB 2.6 is (OpenRTB covers the versions). I found no public adoption figure for ads.cert in bid traffic. <!-- source-gap: adv-ads-cert-adoption | status | how widely ads.cert Authenticated Connections or Call Signs are deployed between exchanges and DSPs | closes with: an IAB Tech Lab or vendor statement of deployment or adoption | checked: 2026-11-22 --> My default, until that changes, is to treat the files and the chain as the enforceable controls and signed connections as an option for specific partners that both support.

## How to Build It

The core model already holds `properties` (with `domain`, `bundle_id` and `store_url`) and `seller_accounts` (with `seller_id`, `seller_type` and `is_confidential`, one row per seller ID per ad system). Supply chain validation adds the crawled evidence and the per-request result: ads.txt and app-ads.txt crawls with their records and variables, sellers.json crawls with their entries, and a supply chain check per sampled bid request. An exchange uses the same tables to watch its publishers' files (does every publisher list this exchange's line?), and a DSP uses them to authorize requests.

```sql
CREATE TABLE ads_txt_crawls (            -- one fetch of one ads.txt or app-ads.txt
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  root_domain      TEXT NOT NULL,        -- public suffix + 1, or the app developer domain
  host             TEXT NOT NULL,        -- the root or a declared subdomain
  file_kind        TEXT NOT NULL CHECK (file_kind IN ('ads_txt', 'app_ads_txt')),
  via              TEXT NOT NULL DEFAULT 'direct' CHECK (via IN ('direct', 'subdomain',
                     'inventory_partner')),
  fetched_at       TIMESTAMPTZ NOT NULL,
  final_url        TEXT,                 -- after redirects
  redirects        TEXT[] NOT NULL DEFAULT '{}',
  http_status      SMALLINT,             -- null: network error
  content_type     TEXT,
  outcome          TEXT NOT NULL CHECK (outcome IN ('ok', 'not_found', 'placeholder',
                     'wrong_content_type', 'too_many_redirects', 'malformed', 'error')),
  content_sha256   BYTEA,
  last_modified    TIMESTAMPTZ,          -- the Last-Modified header
  expires_at       TIMESTAMPTZ NOT NULL, -- cache headers, or fetched_at + 7 days
  malformed_lines  INT NOT NULL DEFAULT 0,
  is_current       BOOLEAN NOT NULL DEFAULT FALSE  -- the copy validation reads
);

CREATE UNIQUE INDEX ads_txt_crawls_current_idx
  ON ads_txt_crawls (host, file_kind) WHERE is_current;

CREATE TABLE ads_txt_records (           -- the data lines of a crawl
  crawl_id         UUID NOT NULL REFERENCES ads_txt_crawls (id),
  line_no          INT NOT NULL,
  ad_system_domain TEXT NOT NULL,        -- field #1, lower-cased
  seller_id        TEXT NOT NULL,        -- field #2, as written
  relationship     TEXT NOT NULL CHECK (relationship IN ('DIRECT', 'RESELLER')),
  cert_authority_id TEXT,                -- field #4
  extension        TEXT,                 -- after ';'
  seller_account_id UUID REFERENCES seller_accounts (id),  -- resolved when the system is known
  PRIMARY KEY (crawl_id, line_no)
);

CREATE INDEX ads_txt_records_lookup_idx ON ads_txt_records (ad_system_domain, seller_id);

CREATE TABLE ads_txt_variables (         -- CONTACT, SUBDOMAIN, INVENTORYPARTNERDOMAIN, OWNERDOMAIN, MANAGERDOMAIN
  crawl_id   UUID NOT NULL REFERENCES ads_txt_crawls (id),
  line_no    INT NOT NULL,
  name       TEXT NOT NULL,              -- upper-cased
  value      TEXT NOT NULL,
  country    CHAR(2),                    -- MANAGERDOMAIN's optional country
  PRIMARY KEY (crawl_id, line_no)
);

CREATE TABLE sellers_json_crawls (       -- one fetch of an ad system's sellers.json
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_system_domain  TEXT NOT NULL,
  ad_system_org_id  UUID REFERENCES organizations (id),
  fetched_at        TIMESTAMPTZ NOT NULL,
  http_status       SMALLINT,
  outcome           TEXT NOT NULL CHECK (outcome IN ('ok', 'not_found', 'malformed', 'error')),
  spec_version      TEXT,                -- the file's "version"
  seller_count      INT,
  content_sha256    BYTEA,
  expires_at        TIMESTAMPTZ NOT NULL,
  is_current        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX sellers_json_crawls_current_idx
  ON sellers_json_crawls (ad_system_domain) WHERE is_current;

CREATE TABLE sellers_json_entries (      -- another system's seller accounts, as published
  crawl_id         UUID NOT NULL REFERENCES sellers_json_crawls (id),
  seller_id        TEXT NOT NULL,
  seller_type      TEXT NOT NULL CHECK (seller_type IN ('PUBLISHER', 'INTERMEDIARY', 'BOTH')),
  is_confidential  BOOLEAN NOT NULL DEFAULT FALSE,
  is_passthrough   BOOLEAN NOT NULL DEFAULT FALSE,
  name             TEXT,
  domain           TEXT,
  comment          TEXT,
  seller_account_id UUID REFERENCES seller_accounts (id),  -- linked when it is a known account
  PRIMARY KEY (crawl_id, seller_id),
  CHECK (is_confidential OR name IS NOT NULL)
);

CREATE TABLE supply_chain_checks (       -- one validation of one request's chain; sampled
  checked_at       TIMESTAMPTZ NOT NULL,
  ad_request_id    UUID NOT NULL,        -- joined to ad_requests by (time, id)
  property_id      UUID REFERENCES properties (id),
  schain_ver       TEXT,
  schain_complete  SMALLINT,             -- 0, 1, 2
  node_count       SMALLINT NOT NULL DEFAULT 0,
  payment_nodes    SMALLINT NOT NULL DEFAULT 0,
  nodes            JSONB NOT NULL DEFAULT '[]',   -- asi, sid, hp per node, as received
  ads_txt_crawl_id UUID,                 -- the copy the check read
  result           TEXT NOT NULL CHECK (result IN ('authorized_direct', 'authorized_reseller',
                     'unauthorized', 'non_participating', 'incomplete', 'missing_chain')),
  failing_node     SMALLINT,
  reason           TEXT,                 -- 'not_in_ads_txt', 'not_in_sellers_json', 'owner_domain_mismatch', ...
  PRIMARY KEY (checked_at, ad_request_id)
) PARTITION BY RANGE (checked_at);
```

The two core tables gain the fields the standards add:

```sql
ALTER TABLE properties
  ADD COLUMN owner_domain TEXT,                  -- OWNERDOMAIN this property's file should declare
  ADD COLUMN ads_txt_host TEXT,                  -- where its file is crawled (root, subdomain or developer domain)
  ADD COLUMN inventory_partner_domains TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN ads_txt_status TEXT,
  ADD COLUMN ads_txt_checked_at TIMESTAMPTZ;

ALTER TABLE properties ADD CONSTRAINT properties_ads_txt_status_check
  CHECK (ads_txt_status IN ('authorized', 'missing_line', 'no_file', 'placeholder', 'error'))
  NOT VALID;

ALTER TABLE seller_accounts
  ADD COLUMN legal_name TEXT,                    -- sellers.json name
  ADD COLUMN domain TEXT,                        -- sellers.json domain; matches the owner's OWNERDOMAIN
  ADD COLUMN is_passthrough BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN published BOOLEAN NOT NULL DEFAULT TRUE,  -- included in this system's own sellers.json
  ADD COLUMN manager_countries CHAR(2)[] NOT NULL DEFAULT '{}';  -- where this seller is a MANAGERDOMAIN

ALTER TABLE seller_accounts ADD CONSTRAINT seller_accounts_seller_id_len_check
  CHECK (length(seller_id) <= 64) NOT VALID;    -- schain sid "should be limited to 64 characters"
ALTER TABLE seller_accounts ADD CONSTRAINT seller_accounts_named_check
  CHECK (is_confidential OR legal_name IS NOT NULL) NOT VALID;

CREATE INDEX CONCURRENTLY seller_accounts_domain_idx ON seller_accounts (domain);
```

Design notes:

- **Crawls are observations, kept whole.** Every fetch is a row with its status, redirects, hash and expiry; the records hang off the crawl, and one crawl per host and kind is `is_current`. A failed fetch never replaces the last good copy, as the specification requires, and the history answers "was this seller authorized on the day of the impression?" ([Observations, Not Overwrites](/docs/building-blocks/record-linkage#observations-not-overwrites)).
- **Own accounts and others' are different tables.** `seller_accounts` is what this system knows and publishes; `sellers_json_entries` is what another system published, linked to a `seller_accounts` row when it is the same account. An exchange generates its sellers.json from `seller_accounts WHERE published`, so the file can't drift from the accounts the bid path uses.
- **The check reads a snapshot, in memory.** The bid path never fetches. A compiled index of current records per host, keyed by (ad system domain, seller ID), and of sellers per (system, seller ID), is built from the tables and shipped to bidders; `supply_chain_checks.ads_txt_crawl_id` records which copy a check used.
- **Results are sampled but complete.** One row per sampled request is enough to report hops and mismatch rates, as the MRC standard requires; the authorization decision itself is applied to every request.
- **Seller IDs are case-preserved strings.** ads.txt's relationship is case insensitive and its domain is a DNS name (lower-cased); the account ID is the exchange's identifier, compared exactly. Integers in ads.txt field #2 are still strings, as OpenRTB's `publisher.id` is.
- **The 64-character limit is enforced at the source.** An exchange that issues seller IDs longer than schain's limit produces chains other systems may truncate; the check on `seller_accounts` catches it where the ID is created.
- **Property status is derived.** `properties.ads_txt_status` is computed from the current crawl and this system's own seller accounts for the property, refreshed after each crawl; publishers see it as a warning that their file is missing this exchange's line, which is the warning the specification asks exchanges to give.

## Auditing

- **Authorization as of the impression.** For any impression or dispute, the ads.txt crawl and sellers.json crawl that were current when the request was checked, and the check's result, so "the seller was authorized" or "it wasn't" is answered from the record, not from today's file.
- **What this system published.** Every version of this system's sellers.json (generated from `seller_accounts`), with the date each seller was added, changed or removed.
- **Hops and mismatches.** Average node count, the share of incomplete and unauthorized chains, and the top failing reasons, by supply path, as the MRC standard asks DSPs to report to buyers.
- **Publisher coverage.** For an exchange, every active publisher property whose file lacks this exchange's line or lists the wrong relationship, and when the publisher was told.
- **Crawler health.** Fetch success rate, hosts stuck on an old copy, and files that changed content, so a crawler bug doesn't look like a market of unauthorized sellers ([Alert Design](/docs/observability/dashboards-and-alerts#alert-design)).

## What This Means for the System You Build

- **Crawl ads.txt, app-ads.txt and sellers.json exactly as specified,** keep every fetch, and never replace a good copy with an error.
- **Resolve files the specified way:** root domain from the Public Suffix List, declared subdomains only, app developer domains from the store listing, inventory partners one hop.
- **Generate your own sellers.json from your seller accounts,** with one entity per seller ID and IDs within schain's 64 characters.
- **Append your node to every SupplyChain object you forward,** never rewrite earlier nodes, and send version 1.1 with non-payment nodes when you know them.
- **Check every payment node** against ads.txt and sellers.json, the first node against OWNERDOMAIN or MANAGERDOMAIN, and the last against the request.
- **Run the check on the bid path from in-memory snapshots,** and record sampled results with the copy they read.
- **Report hops and mismatches** to buyers and sellers, and tell publishers when their file is missing your line.
- **Treat buyers.json, DemandChain and ads.cert as optional signals** until your partners support them, and the files and chain as the controls you enforce.

## References

**Specifications**

- [IAB Tech Lab: ads.txt 1.1 specification (PDF)](https://iabtechlab.com/wp-content/uploads/2022/04/Ads.txt-1.1.pdf), the change log from 1.0 to 1.1, the record fields, the variables, the placeholder record, access rules, redirects, status codes, the 7-day default expiry, subdomain handling and implementer notes
- [IAB Tech Lab: ads.txt and app-ads.txt](https://iabtechlab.com/ads-txt/), ads.txt 1.1 released August 2022, app-ads.txt 1.0, the prototype crawler, parser and aggregator
- [IAB Tech Lab: app-ads.txt specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/Supply-Chain-Validation/main/app-ads.txt.md), developer domain discovery from store listings, store meta tags, storeurl matching, crawl frequency and differences from ads.txt
- [IAB Tech Lab: sellers.json specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/Supply-Chain-Validation/main/sellers-json.md), the parent and seller fields, seller types, confidentiality, passthrough, the one-entity-per-ID rule, location and caching
- [IAB Tech Lab: sellers.json](https://iabtechlab.com/sellers-json/), finalized for adoption on July 31, 2019
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the Source object, SupplyChain and SupplyChainNode at version 1.1, and the publisher ID corresponding to a sellers.json seller_id
- [IAB Tech Lab: OpenRTB 2.x releases](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/releases), the 2.6-202611 release of November 18, 2026 updating the objects to schain 1.1 with the new complete values
- [IAB Tech Lab: SupplyChain object](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/supplychainobject.md), the standalone 1.0 document and the move from source.ext.schain to source.schain
- [IAB Tech Lab: Supply chain foundations](https://iabtechlab.com/standards/supply-chain-foundations/), the versions and dates listed for ads.txt, sellers.json, SupplyChain, buyers.json, DemandChain and ads.cert
- [IAB Tech Lab: buyers.json and DemandChain](https://iabtechlab.com/buyers-json-demand-chain/), version 1.0 of June 2021, their purpose, and the request for feedback
- [IAB Tech Lab: ads.cert](https://iabtechlab.com/ads-cert/), ads.cert 2.0, Call Signs, Authenticated Connections, future protocols and the 1.0 history
- [IAB Tech Lab: OpenRTB 3.0](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/OpenRTB%20v3.0%20FINAL.md), the ads.cert signing fields marked beta
- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), the SupplyChain requirements, the three DSP validation duties, ads.txt 1.1 support and MANAGERDOMAIN

**In practice**

- [Display & Video 360: Authorized Digital Sellers](https://support.google.com/displayvideo/answer/7509551?hl=en), checking every SupplyChain seller against ads.txt, empty chains as unauthorized, the three authorization options and non-participating publishers
- [Google Ad Manager: Bid transparency with the SupplyChain object](https://support.google.com/admanager/answer/10368261?hl=en), Google's nodes by scenario, upstream nodes, excluded non-payment intermediaries, MCM requirements and serialization order
- [Google Ad Manager: Ensure ads.txt/app-ads.txt can be crawled](https://support.google.com/admanager/answer/7673979), the 24-hour crawl, redirect and robots.txt rules, status handling, the five-day retention and the app-ads.txt subdomain rule
- [Google Ad Manager: Create ads.txt/app-ads.txt in Ad Manager](https://support.google.com/admanager/answer/7544382?hl=en), generated lines covering only Google seller accounts
- [Google Ad Manager: Troubleshoot diagnostic reports for MCM](https://support.google.com/admanager/answer/12207502?hl=en&ref_topic=12051919), that validation differs across DSPs
- [Prebid.js: Supply chain module](https://docs.prebid.org/dev-docs/modules/schain.html), configuring schain as first-party data and appending bidder-specific nodes
