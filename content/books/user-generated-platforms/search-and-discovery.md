+++
title = "Search & Discovery"
description = "Keyword search over community content, keeping the index in step with removals, visual search, translation, AI answers with citations, and safety in search."
category = "User-Generated Platforms Industry"
order = 1807
part = "Communities and Conversation"
tags = ["user-generated-content", "search", "visual-search", "ai-answers", "translation"]
+++

Search is how people find what a community already said. Someone with a broken dishwasher, a question about a game build or a symptom they'd rather not ask a person about types it into a search box, and the answer is a thread from three years ago with forty replies. On community platforms that thread is the product: it was free to create, it's durable, and it keeps attracting readers long after its author left. Reddit's 10-K counts over 80 million people searching on Reddit every week; Pinterest's says over 90% of searches on Pinterest are unbranded, people looking for an idea rather than a product name.

Search on user content is harder than search on a catalog because the corpus is hostile and mutable. Posts are edited, removed by moderators, deleted by authors, made private when a community closes, and hidden from the people who blocked their authors; every one of those changes has to reach the index before the next query, or search becomes the way to read what moderation took down. Spammers write for the ranking function. And the newest layer, AI answers composed from community posts, can repeat a removed comment as confident advice unless it's held to the same rules.

This chapter covers what people search for on community platforms, the indexing pipeline and its consistency with moderation, ranking signals, typeahead and tags, visual search, machine translation of user content, AI answers with citations, safety interventions in search, and query logs as personal data. It adds translations, query logs, media embeddings and AI answer records to [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Search over chat messages and direct messages is [Real-Time Chat](/books/user-generated-platforms/real-time-chat#chat-search); search engines and AI companies licensing the corpus are [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#data-licensing-as-an-engineering-obligation); AI labeling and provenance are [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#labeling-ai-generated-content).

## How the Platforms Do It

| Platform | What people search | Notable public detail |
| --- | --- | --- |
| **Reddit** | Posts, comments, communities, people | Over 80 million weekly searchers; Reddit Answers (AI answers from threads) in beta from December 2024, upgraded with Google's Gemini through Vertex AI in April 2025, and integrated into core search during 2025; machine translation of posts into 35 languages |
| **Pinterest** | Ideas, products, images | Over 90% of searches unbranded; visual search from Related Pins (2014) through Lens camera search (2017) |
| **Discord** | Messages inside servers and DMs | Elasticsearch in "cells" of smaller clusters, guilds sharded by id, DMs indexed per user ([Real-Time Chat](/books/user-generated-platforms/real-time-chat)) |
| **Imgur, Tumblr** | Tags, titles, galleries | Tag-driven discovery |
| **Bluesky** | Posts and people across the network | Search is an AppView function, separate from the user's data host ([Federation & Open Protocols](/books/user-generated-platforms/federation)) |

The pattern: **community search is three searches.** People search for content (posts and comments), for places (communities and channels) and for people (accounts and handles), and each has different ranking and different safety rules. Content search ranks by relevance and community judgment; place search ranks by fit and activity and must respect community visibility and content rating; people search is where harassment and impersonation start, so it respects blocks, privacy and minors' defaults first.

## The Index and the Moderation Clock

The search index is a projection of the content tables, fed by their life-cycle events. The index engine (Elasticsearch, OpenSearch, Vespa, or a database's own full-text search at small scale) is a commodity; the platform builds what goes in, how it's ranked, and how fast it changes, which is the [Build, Buy or Rent](/books/user-generated-platforms/platform-landscape#build-buy-or-rent) default of building the ranking and renting the engine.

What makes community search different is that **deletion latency is a safety property.** A removed post that stays searchable for an hour is still published for that hour. The pipeline rules:

- **Index from events, not from polling.** `content.published`, `content.edited`, `content.removed`, `content.deleted` and `content.restored` from the outbox drive index updates ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)), and so do changes that alter visibility without touching the item: a community going private or banned, an author's account suspended or closed, a label applied.
- **Removals jump the queue.** Index updates that remove or hide documents go through a separate, higher-priority path than additions, with their own latency target and alert.
- **Filter at query time as well.** The index carries the item's state, community, visibility, content rating and labels; queries filter on them, and the result page re-checks current state on hydration, so a removal that hasn't reached the index still doesn't render.
- **Viewer filters run per query.** Blocked authors, communities the viewer can't see (private, or above their age band's rating), and the viewer's own label preferences are applied to every query, never cached across viewers.
- **Re-index from the source.** A full rebuild from the content tables is a routine job, because schemas, analyzers and ranking features change; the index is never the record.

**Edits replace, revisions don't accumulate.** The index holds each item's current revision; search over old revisions is an investigation tool for moderators, served from the content store, not the public index.

## Ranking Community Search

Text relevance (BM25 or its successors, now usually blended with embedding similarity) gets the candidate set; community signals order it:

- **Community judgment:** the item's confidence score and vote count ([Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#ranking-formulas)), with the same manipulation discounts.
- **Answer-ness:** for question-shaped queries, threads with accepted or highly voted answers beat threads with only the question.
- **Freshness by intent:** a query about a news event wants hours-old posts; a query about fixing a dishwasher wants the best thread regardless of age. Intent classification picks the decay.
- **Community quality and fit:** results from active, well-moderated communities on the query's topic beat stray mentions elsewhere.
- **Author standing:** accounts with penalties or spam signals are demoted or excluded.

Spam is written for search. Keyword-stuffed posts, link farms that seed product names into old threads, and accounts that comment the same affiliate link under every popular question are search problems first. Search ranking reads the spam signals of [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#how-to-build-it) and the community's own removals, and an item removed as spam anywhere teaches the ranker about the account and the link everywhere.

**Typeahead** for communities and people is its own index: prefix matching on names and handles (the normalized handle keys from [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#accounts-and-handles)), ranked by size and activity, filtered for visibility and blocks, and conservative about minors (accounts that are private or not discoverable never appear). **Tags and hashtags** are user-supplied facets: normalize them like handles, cap how many an item carries, and moderate the tag itself, because a tag can become the meeting point for content the platform doesn't allow.

## Visual Search

Visual search answers "more like this" and "what is this" for images. Pinterest's 2017 paper traces the progression: **Related Pins** (2014) recommended similar pins from engagement, **Similar Looks** (2015) found visually similar fashion items, **Flashlight** (2016) let users select an object inside a pin and search for it, and **Lens** (2017) took a photo from the camera as the query. The building blocks are the same in every system since:

1. **Object detection** finds the regions worth searching (a lamp, a shoe, a chair) inside an image.
2. **Embedding models** turn each region or whole image into a vector, so visual similarity becomes distance.
3. **Approximate nearest-neighbor search** over billions of vectors returns candidates in milliseconds.
4. **Re-ranking** blends visual similarity with engagement and text signals, and filters by visibility and safety exactly as text search does.

Embeddings are per model version: a new model means re-embedding the corpus and running both indexes until the switch. They also carry safety value: an embedding near known policy-violating images is a cheap prioritization signal, though perceptual hashes for known illegal content are a separate, list-matched system owned by [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#hash-matching), never a search feature.

## Translation

Most of a large community's content is in one language and much of its audience isn't. Reddit's 10-K says over 90% of posts created are in English, about 57% of its users visited from outside the US, and it has made machine translation available in 35 languages, with about a billion posts translated. Translation turns one community's archive into content for readers in other languages, and it makes cross-language search possible: a query in Portuguese can find an English thread through its translation.

Translation changes the moderation surface. A translated post is a derived rendering of the author's words; it must be invalidated when the original is edited, removed or deleted, labeled as machine-translated so readers know what they're reading, and kept out of evidence (reports and decisions point at the original revision, with the translation shown to the reviewer as an aid). Moderators reviewing content in a language they don't read rely on the same translations, which is a reason to record which engine and version produced each one.

## AI Answers over Community Content

An AI answer engine retrieves threads relevant to a question and has a model compose an answer from them, with citations back to the threads. Reddit Answers is the reference case: launched in beta in December 2024, upgraded with Google's Gemini through Vertex AI in April 2025, and integrated into Reddit's core search during 2025, with rollout to languages beyond English, per its 10-K. Reddit's licensing partnership with Google in February 2024 also included using Vertex AI to improve search on Reddit.

The design rules follow from what can go wrong:

- **Retrieval obeys the same filters as search.** The retriever runs with the viewer's visibility, blocks, age band and label preferences, over currently published items only. An answer composed from a removed comment is publishing it again.
- **Every claim cites a thread.** Citations link to the items the answer drew on; an answer that can't cite is not shown. Store the cited item ids and revisions with the answer.
- **Cached answers expire on removal.** Answers to popular questions are cached; any removal, deletion or label change on a cited item invalidates every cached answer that cites it.
- **Health, legal and safety questions get guardrails.** Community advice on medication, self-harm, or legal emergencies is exactly where a fluent summary of strangers' opinions does harm; route those queries to curated resources and show the threads rather than a synthesized answer, the [AI Agents in the Product](/docs/architecture/ai-agents#emergencies-skip-the-model) principle that emergencies skip the model.
- **Attribution is part of the bargain.** Answers that keep readers off the threads reduce the visibility and votes that motivate the people who wrote them; the citation design (who is named, how prominent the link is) is a creator-relations decision as much as a UX one.
- **Evaluate before and after launch** with question sets that include removed content, adversarial prompts and sensitive topics ([Evals](/docs/architecture/ai-agents#evals)).

AI-generated content labels, provenance and model training on community data are [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms)' subject.

## Safety in Search

Search boxes receive queries for illegal material, and the industry's response is deterrence, not just empty results. The best-documented example is the reThink chatbot developed by the Internet Watch Foundation and the Lucy Faithfull Foundation and deployed by Aylo on Pornhub's UK site: when a search used one of more than 28,000 banned terms, a warning that the behavior is illegal and a chatbot pointing to the Stop It Now support service appeared. Between March 2022 and August 2023 it was displayed 2.8 million times, led to 1,656 requests for more information or support and 490 click-throughs to the support site, and an evaluation led by the University of Tasmania found it reduced total searches for child sexual abuse material on the site.

For a community platform the mechanism is the same: a term list maintained with child-safety organizations (never published), matched against normalized queries, returning no results plus a deterrence message and support links, with the match counted for transparency reporting and the policy owned by trust and safety. Searches for self-harm content get support resources at the top of results. Searches for terrorist content and other illegal categories return nothing and are measured. None of these lists or their contents belong in client code or public repositories.

## Query Logs Are Personal Data

A search history says what someone worried about, wanted, or was looking for at 3 a.m. Treat it accordingly:

- **Keep raw queries briefly.** Ranking and spelling models need aggregates; raw query text tied to an account is kept for a short window, then aggregated or de-identified ([Data Retention & Deletion](/docs/architecture/data-retention#retention-windows)).
- **Separate safety logs.** Queries that matched a safety list are counted, and their retention follows the trust and safety policy rather than the analytics one.
- **Expect legal requests.** Search history is among the records law enforcement asks for; what exists determines what can be disclosed, which is [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework)'s subject.
- **Export and erase.** A user's search history is part of their data export and erasure scope under GDPR ([GDPR](/docs/compliance/gdpr#data-subject-rights)).

## How to Build It

The chapter's additions to the core model. The search and vector indexes themselves live in the search engine; these are the records the platform keeps about them:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE content_translations (      -- machine renderings of a revision; never evidence
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  content_revision_id UUID NOT NULL REFERENCES content_revisions (id),
  language            TEXT NOT NULL,     -- BCP 47 target
  title               TEXT,
  body                TEXT,
  engine              TEXT NOT NULL,     -- vendor or model, with version
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invalidated_at      TIMESTAMPTZ,       -- original edited, removed or deleted
  UNIQUE (content_revision_id, language, engine)
);

CREATE TABLE search_queries (            -- short-lived; partitioned by day and dropped
  id                 UUID NOT NULL DEFAULT uuidv7(),
  occurred_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  account_id         UUID REFERENCES accounts (id),  -- null when logged out
  session_ref        TEXT,
  surface            TEXT NOT NULL CHECK (surface IN ('content', 'communities', 'people',
                       'visual', 'answers')),
  query_text         TEXT,               -- cleared when a safety rule matched
  language           TEXT,
  safety_rule_id     TEXT,               -- the deterrence rule that fired, if any
  result_count       INT,
  clicked_item_ids   UUID[],
  PRIMARY KEY (occurred_at, id)
) PARTITION BY RANGE (occurred_at);

CREATE TABLE media_embeddings (          -- visual search vectors per model version
  media_asset_id  UUID NOT NULL REFERENCES media_assets (id),
  model_version   TEXT NOT NULL,
  region          BOX,                   -- the detected object's bounding box; null: whole image
  embedding       VECTOR(256) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (media_asset_id, model_version, region)
);

CREATE TABLE ai_answers (                -- every answer shown, with what it was built from
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  query_hash         BYTEA NOT NULL,     -- the normalized question, for caching
  language           TEXT NOT NULL,
  answer_text        TEXT NOT NULL,
  model_version      TEXT NOT NULL,
  retrieval_version  TEXT NOT NULL,
  viewer_filter_key  TEXT NOT NULL,      -- age band, region and label settings it was built for
  status             TEXT NOT NULL CHECK (status IN ('served', 'invalidated', 'withheld')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE ai_answer_citations (
  ai_answer_id        UUID NOT NULL REFERENCES ai_answers (id),
  position            SMALLINT NOT NULL,
  content_item_id     UUID NOT NULL REFERENCES content_items (id),
  content_revision_id UUID NOT NULL REFERENCES content_revisions (id),
  PRIMARY KEY (ai_answer_id, position)
);

CREATE INDEX ai_answer_citations_item ON ai_answer_citations (content_item_id);
```

Notes on the sketch:

- **Index documents carry moderation state.** The document for a content item holds its state, community, community visibility, content rating, labels, author standing and language; a change to any of them is an index update with the removal path's priority when it hides something.
- **Translations are invalidated, not edited.** A new revision gets new translations; the old ones are marked invalid and dropped from the index.
- **Removal reaches answers through citations.** On `content.removed`, `content.deleted` or `label.applied`, a job finds every `ai_answers` row citing the item through `ai_answer_citations_item` and invalidates it ([Background Jobs](/docs/architecture/background-jobs)).
- **Embeddings are versioned.** A model change writes a new set beside the old, the vector index is rebuilt, and the old rows are dropped after cutover. In production the vectors live in the search engine or a vector service; the table is the record of what was embedded with which model.
- **Query logs are partitions with a drop date,** so retention is a partition drop, not a delete scan; the safety-rule counts are aggregated before the drop.
- **Events:** search consumes content, community, account and label events; it emits `search.safety_rule_matched` (counted, without query text) and `answer.invalidated`.

## Auditing

- **Index latency for removals,** measured per removal from decision to disappearance from results and from cached answers, with alerts on the tail; it's the number that shows search isn't a back door.
- **Every AI answer shown,** with its citations, model and retrieval versions, for the answer cache's lifetime and a defined window after, because a harmful answer will be reported with a screenshot.
- **Safety rule matches** as counts per rule and period, for transparency reporting, without retaining the queries beyond policy.
- **Translation engine and version** per translation used in a moderation decision.
- **Ranking and filter configuration over time,** so a change in what search surfaces can be traced to a release.

## What This Means for the System You Build

- **Treat search as three searches,** content, communities and people, each with its own ranking and safety rules.
- **Index from life-cycle events** and give removals a faster path than additions, with a measured latency target.
- **Filter by state, visibility, rating and blocks** in the query and again at render.
- **Build ranking on community signals** (confidence, answers, community quality, author standing) and spam signals; rent the engine.
- **Make typeahead conservative** for people and minors, and moderate tags like content.
- **Version embeddings** and re-embed on model changes for visual search.
- **Label and invalidate translations** with the original, and keep them out of evidence.
- **Hold AI answers to search's filters,** require citations, store them, and invalidate on any removal of a cited item.
- **Route health, legal and safety questions** to curated resources instead of synthesized answers.
- **Run deterrence on illegal-content queries** with lists kept by trust and safety, and count matches.
- **Keep raw query logs briefly** and include them in export and erasure.

## References

**Papers**

- [Zhai et al.: Visual Discovery at Pinterest (2017)](https://arxiv.org/abs/1702.04680), Related Pins, Similar Looks, Flashlight and Lens, object detection and embeddings

**In practice**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), weekly searchers, Reddit Answers integrated into search and rolling out to other languages, share of English posts and international users, machine translation in 35 languages
- [Pinterest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000021/pins-20251231.htm), unbranded share of searches and search as a core surface
- [TechCrunch: Reddit's conversational AI search tool leverages Google Gemini](https://techcrunch.com/2025/04/09/reddits-conversational-ai-search-tool-leverages-google-gemini/), Reddit Answers in beta from December 2024 and the Gemini on Vertex AI upgrade (April 9, 2025)
- [Google: An expanded partnership with Reddit](https://blog.google/inside-google/company-announcements/expanded-reddit-partnership/), Vertex AI for Reddit's search features and Data API access (February 22, 2024)
- [Internet Watch Foundation: reThink chatbot evaluation](https://iwf.org.uk/about-us/why-we-exist/our-research/rethink-chatbot-evaluation), banned-term warnings and chatbot on Pornhub UK, display and click-through counts, and the reduction in searches (March 2022 to August 2023)
