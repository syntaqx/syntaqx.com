+++
title = "Feeds & Recommendations"
description = "The social graph, feed types, fan-out, candidate generation and ranking, graph and sequence models, logged-out economics, re-engagement, and feed rules."
category = "User-Generated Platforms Industry"
order = 1806
part = "Communities and Conversation"
tags = ["user-generated-content", "feeds", "recommendations", "ranking", "notifications"]
+++

A feed decides which few dozen of a platform's billions of items a person sees today. On a community platform it started as a list: the newest posts from the communities you joined and the people you follow, ranked by the community's votes. It became a recommendation system: posts from communities you never joined, chosen by models trained on what people like you engaged with, mixed into the same scroll and pushed to your phone when you stop opening the app. The feed is now where most attention is allocated, which makes it the platform's main product decision, its largest compute bill, and, in the EU and in a growing number of US states, a regulated system.

The engineering problem is selection at scale under latency. A home feed request has a few hundred milliseconds to narrow hundreds of millions of candidates to a ranked page, filter out what the viewer must not see (blocked authors, removed posts, content their age or country rules out), and log what was shown so the next model can learn from it. The product problem is choosing what to optimize, because engagement is easy to measure and only loosely related to whether people are glad they came.

This chapter covers the social graph that feeds read, feed types, fan-out, the multi-stage recommendation pipeline, graph and sequence models from public papers, objectives and integrity demotions, feed rules from regulation, logged-out economics, cold start and re-engagement notifications. It adds the graph (follows, friendships, blocks), feed definitions and impression logs to [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Scores from votes are [Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#ranking-formulas); search is [Search & Discovery](/books/user-generated-platforms/search-and-discovery); protocol-level custom feeds are [Federation & Open Protocols](/books/user-generated-platforms/federation#the-at-protocol); minors' feed rules are [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#defaults-by-age).

## How the Platforms Do It

| Platform | Graph | Main surfaces | Public detail |
| --- | --- | --- | --- |
| **Bluesky** | One-way follows | Following, plus custom feeds users choose | Feed generators are independent services returning post lists that the app hydrates |
| **Discord** | Servers and friends | No ranked feed of server content | Chronological channels; discovery through server directories |
| **Pinterest** | Boards and follows; a pin-to-board graph | Home Feed, Related Pins, Search, notifications | Pixie random walks, PinSage graph network, TransAct sequence model, GPU serving (papers) |
| **Reddit** | Community memberships, follows | Home feed, community feeds, popular | Logged-out visitors, mostly from search engines, are monetized with conversation-page and feed ads (10-K) |
| **X (Twitter)** | One-way follows | Following and For You timelines | Recommendation code open-sourced in 2023: in-network and out-of-network candidate sources, light and heavy rankers, visibility filters, a mixer |
| **YouTube** | Subscriptions | Home, Up Next, Shorts | Two-stage candidate generation and ranking with deep networks (2016 paper) |

Three shapes of feed sit in that table. **Chronological graph feeds** (Bluesky's Following, a Discord channel) show what the people and places you chose posted, newest first. **Community-ranked feeds** (a Reddit community's hot list) rank by the community's votes. **Personalized recommendation feeds** (Pinterest Home Feed, X's For You, YouTube Home) rank by a model of each viewer, from candidates far beyond their graph. Most platforms now run all three and let the user switch, which regulation increasingly requires.

## The Graph Feeds Read

A feed starts from the viewer's graph, and the edge types behave differently:

- **Follows** are one-way and need no consent: you follow a person, a community, a tag or a board. They're the primary input to following feeds and a strong signal for recommendations.
- **Friendships** are mutual: one side requests, the other accepts. They matter more for chat (who may message whom) than for feeds, and they're the edge that unlocks privacy-sensitive features, which is why Discord's UK safety changes treat "no mutual friends" as the trigger for a friend-request warning and route direct messages from non-friends into a separate inbox ([Real-Time Chat](/books/user-generated-platforms/real-time-chat#direct-messages-and-the-stranger-problem)).
- **Memberships** in communities come from [Communities, Roles & Permissions](/books/user-generated-platforms/communities-and-permissions#membership-invites-and-gates).
- **Blocks and mutes** are one-way filters. A block hides each from the other everywhere: feeds, replies, search, mentions, recommendations, chat. A mute hides the target from the muter's own feeds without telling anyone. Both must be enforced in every service, not only in the feed; the Gaming volume's [social graph](/books/gaming/social-systems#the-social-graph) covers the same rules for game social layers.

Teen defaults reach the graph too. Pinterest made accounts of users under 16 private and not discoverable in 2023 and in 2025 made 13-to-15-year-olds private with no option to go public; a private account doesn't appear as a candidate in strangers' recommendations at all. Which defaults the law requires is [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#defaults-by-age)'s.

## Fan-Out on Write, Fan-Out on Read

A following feed can be built two ways. **Fan-out on write** pushes each new post's id into every follower's precomputed feed list when it's published; reading a feed is a cheap list read. **Fan-out on read** stores nothing per follower and, at read time, gathers recent posts from everyone the viewer follows and merges them. Write fan-out makes reads fast and writes expensive in proportion to follower count; read fan-out does the reverse.

The celebrity problem decides it: an account with ten million followers turns one post into ten million writes. The standard answer is a hybrid. Fan out on write for ordinary authors, and for authors above a follower threshold, skip the fan-out and merge their recent posts at read time. The per-viewer lists are a cache with a bounded length (a few hundred ids), rebuilt from the graph and recent posts when missing, never the record of what exists. Removal must reach them: a removed post's id stays in cached lists, so the read path checks state on hydration and drops it, and a sweep cleans lists after a removal of anything widely fanned out.

## The Recommendation Pipeline

Personalized feeds converge on the same stages, whatever the platform calls them:

1. **Candidate generation (retrieval).** Several sources each propose hundreds to thousands of items cheaply: recent posts from the viewer's graph, items engaged with by similar users, nearest neighbors of the viewer's embedding, items related to what they just engaged with, trending items in their communities and regions. YouTube's 2016 paper describes this split as two networks, one that narrows the corpus to a few hundred candidates and one that ranks them. X's open-sourced recommendation code describes in-network candidates from its search index (about half of the For You timeline, per its README) and out-of-network candidates from graph traversal and embedding services.
2. **Light ranking (pre-ranking).** A cheaper model trims thousands of candidates to hundreds.
3. **Heavy ranking.** A large model scores each remaining candidate with many features (viewer, item, author, context) for several predicted outcomes: click, long view, like, save, reply, share, hide, report.
4. **Filtering and policy.** Hard filters remove what the viewer must not see: blocked and muted authors, removed or pending items, labels the viewer filters or their age band can't see, content their country restricts, communities they left. X's code calls this layer visibility filters, combining hard filters, visible treatments (labels and interstitials) and downranking.
5. **Mixing and diversity.** The final page interleaves sources, limits consecutive items from one author or community, inserts ads and other modules, and applies freshness rules.

Two rules keep the pipeline honest. **Filters run after ranking, and again at render.** Ranking is expensive and cached; state changes in the meantime, so the last check before the item reaches the screen reads current state. **Every served page is logged** with the candidates' sources, the model versions and the positions, because the next model is trained on what this one chose to show, and without the log there's no way to separate "people didn't like it" from "nobody saw it."

![The recommendation pipeline. Five candidate sources (the viewer's graph, similar users, nearest embeddings, related items, trending) join into retrieve (thousands of candidates), then light rank (to hundreds), heavy rank (many predicted outcomes), filter, accented (after ranking, and again at render), mix (diversity, ads, freshness) and serve (the page). The served page goes to a page log, and the next model, drawn dashed, is trained on what was shown.](/diagrams/ugp-feeds-pipeline.svg "Cheap stages narrow, expensive stages score, and filtering runs last so it reads current state. The log of what was served is the next model's training data.")

### Graph Models

Pinterest's published systems are the most detailed public account of recommendations built on a content graph rather than a social one. Users save pins to boards, which makes a bipartite graph of pins and boards: two pins are related when many boards hold both.

- **Pixie** (2017) runs random walks on that graph in memory: 3 billion nodes and 17 billion edges on each server, answering about 1,200 requests a second per server at 60 milliseconds; the paper reports that Pixie-backed systems drove over 80% of engagement and that pruning the graph raised engagement by 58%. A random walk from the pins a user just engaged with visits pins that co-occur on boards, weighted by how often they're reached: candidate generation without training a model.
- **PinSage** (2018) is a graph convolutional network over the same graph (3 billion nodes, 18 billion edges, trained on 7.5 billion examples) that learns an embedding per pin from its features and its random-walk neighborhood, so related-item retrieval becomes nearest-neighbor search over embeddings.

The lesson generalizes beyond pins: whatever users group content into (boards, playlists, communities, lists) is a graph that says which items belong together, and it's often a better signal than the follow graph.

### Sequence Models

**TransAct** (2023) is Pinterest's transformer over a user's real-time sequence of recent actions, combined with batch-computed long-term user embeddings; the paper describes it in production across Homefeed, Related Pins, Notifications and Search. The hybrid is the point: a batch embedding captures who someone is, and a short real-time sequence captures what they're doing now, which is what makes a feed respond within a session to a sudden interest.

Serving these models is a hardware decision. NVIDIA's account of Pinterest's move to GPU serving (vendor-written) describes models about 100 times larger moved to GPUs, a home feed engagement gain of up to 16%, and a funnel from roughly 300 billion images to about 50 shown to a person.

## What the Feed Optimizes

A heavy ranker predicts several outcomes, and a value model combines them into one score: weights on likes, saves, replies, long views, and negative weights on hides, reports and unfollows. The weights are the platform's editorial policy expressed as arithmetic, and they're where most feed controversies start. Three practices separate a deliberate value model from an accidental one:

- **Count negative signals.** Hides, "not interested," reports, unfollows and blocks after an impression are the cheapest measures of a bad recommendation; a model that only predicts engagement learns that outrage works.
- **Ask people.** Survey prompts ("was this worth your time?") on a sample of impressions give a label that engagement doesn't, and can be predicted and added to the value model.
- **Demote by policy, separately.** Items that are allowed but borderline (close to a policy line, from low-quality sources, flagged by fact-check or crowd context) get a demotion applied after scoring, recorded as its own reason, rather than being learned implicitly. That makes the demotion explainable to a creator, countable in a transparency report and testable in an experiment.

## Feed Rules from Regulation

Feeds are no longer only a product decision:

- **The EU Digital Services Act, Article 27,** requires online platforms that use recommender systems to set out the main parameters in their terms and conditions, including the criteria that matter most and why, and, where users can choose between options, to offer a control to select and change the ordering at any time from the place where content is ranked.
- **Article 38** requires very large platforms to offer, for each recommender system, at least one option not based on profiling. In practice that's a chronological or community-ranked feed the user can switch to and stay in.
- **Minors.** Several US states have passed laws restricting algorithmic feeds or notifications for minors, and their court status changes often; [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#us-state-laws-and-their-court-status) tracks them. The engineering consequence is the same everywhere: the feed type and notification schedule must be selectable per account by rule, with the age band and jurisdiction as inputs ([Rules as Data](/docs/architecture/rules-as-data)).
- **Liability.** Courts have begun to treat a platform's own recommendations as its own conduct rather than as third-party content; [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#the-litigation) covers the cases. The engineering consequence is that recommendation decisions need records: which model, which candidates, which demotions, for which viewer.

My default is to build the non-profiled feed first and keep it first-class: a user-selectable mode stored on the account, honored by every surface (home, notifications, related items), with its own tests. A non-profiled option that only works on one screen is not the option the law asks for.

## Logged-Out Economics

Much of a community platform's audience never signs in. Reddit's 10-K describes logged-out visitors, mostly arriving from search engines, as monetized through ads on conversation pages and in feeds, and Reddit said it would stop reporting logged-in and logged-out daily uniques separately from the quarter ending September 30, 2026. Pinterest's 10-K shows the other half of the economics: average revenue per user in 2025 was $30.84 in the US and Canada, $5.12 in Europe and $0.83 in the rest of the world.

For the feed, logged-out means:

- **No graph, little history.** Recommendations for a logged-out reader run on the page they landed on (the thread, the pin, the community), their region and language, and a short session history. Related items on the landing page are the feed.
- **Cache-friendly pages.** Landing pages from search are served to many anonymous readers, so their related-item modules are computed per page and cached, not per viewer.
- **The conversion question.** Logged-out readers are worth less per view but arrive in volume; the product decides how hard to push sign-up (and the app) against the risk of losing the reader to the next search result.
- **Consent.** Personalization of logged-out readers runs on cookies or device identifiers, which the ePrivacy and GDPR consent rules govern in the EU; a reader who declines gets the non-personalized ranking ([GDPR](/docs/compliance/gdpr#lawful-bases)).

## Cold Start

**New users** have no history. The first session asks for interests (communities, topics, boards), uses region and language, and leans on popular-in-region candidates while the sequence model collects the first actions; the first few dozen impressions are worth more for learning than for engagement, so some exploration is deliberate.

**New items** have no engagement. Each candidate source has to give new items a path into the pool: the author's followers and community see them first (the community's "new" list, a following feed), a share of impressions is reserved for exploration, and an item's early engagement relative to its audience size decides whether it graduates to wider recommendation, the same proving-ground idea as a gallery's rising list ([Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#viral-galleries)).

**New communities** need a seed audience before votes mean anything, which is why community directories, onboarding picks and cross-community recommendations ("people in this community also joined") exist.

## Re-Engagement Notifications

Notifications are the feed reaching out of the app. Some are transactional and expected (a reply, a mention, a message, a moderator's notice); others are recommendations: "a post in a community you follow is trending," "you might like this pin," a daily digest email. TransAct's deployment in Pinterest's notifications is a reminder that the same ranking models choose them.

Recommendation-driven notifications need their own budget:

- **A per-user cap** on recommendation pushes per day and per week, learned per user within a hard ceiling, with opens and disables as the labels.
- **Quiet hours** in the user's time zone.
- **Consent and purpose.** Push and email for recommendations are marketing in purpose, with opt-outs that must work; the playbook's [Notifications & Consent](/docs/architecture/notifications#purpose-decides-everything) covers the consent ledger, the single outbound gate and re-checking eligibility at send time.
- **Re-check at send.** Between selection and delivery the post may have been removed or the user may have blocked its author; the send-time check reads current state ([Event-Triggered, Re-Checked at Send Time](/docs/architecture/notifications#event-triggered-re-checked-at-send-time)).
- **Minors.** Rules limiting notifications to minors at night or by default are the most common feature restrictions in recent state laws and proposals; the cap and quiet hours must be configurable per age band.

## Measuring It

- **Online experiments** with holdouts per surface, measuring long-run retention and survey satisfaction, not only session engagement.
- **Impression logs** with position and source, so offline evaluation can correct for what was shown (position bias) and counterfactual policies can be estimated.
- **Integrity metrics** next to engagement: how often removed or later-removed content was recommended, how often minors saw content their band shouldn't, and how often a demotion fired. A recommendation system that lifts engagement while raising the share of later-removed content in feeds is amplifying harm, and the prevalence measurement in [Moderation at Scale](/books/user-generated-platforms/moderation-at-scale#measuring-prevalence) is the check.

## How to Build It

The chapter's additions to the core model:

```sql
CREATE TABLE follows (                   -- one-way edges to accounts, communities or tags
  follower_account_id UUID NOT NULL REFERENCES accounts (id),
  target_type         TEXT NOT NULL CHECK (target_type IN ('account', 'community', 'tag',
                        'collection')),
  target_id           TEXT NOT NULL,     -- id, or the tag itself
  notify              BOOLEAN NOT NULL DEFAULT FALSE,  -- "tell me when they post"
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_account_id, target_type, target_id)
);

CREATE TABLE friendships (               -- mutual, consented edges
  account_low_id  UUID NOT NULL REFERENCES accounts (id),  -- smaller id of the pair
  account_high_id UUID NOT NULL REFERENCES accounts (id),
  requested_by    UUID NOT NULL REFERENCES accounts (id),
  state           TEXT NOT NULL CHECK (state IN ('pending', 'accepted', 'declined')),
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,           -- unanswered requests lapse
  PRIMARY KEY (account_low_id, account_high_id),
  CHECK (account_low_id < account_high_id),
  CHECK (requested_by IN (account_low_id, account_high_id))
);

CREATE TABLE blocks (                    -- one-way; enforced by every service
  blocker_account_id UUID NOT NULL REFERENCES accounts (id),
  blocked_account_id UUID NOT NULL REFERENCES accounts (id),
  kind               TEXT NOT NULL CHECK (kind IN ('block', 'mute')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at         TIMESTAMPTZ,        -- timed mutes
  PRIMARY KEY (blocker_account_id, blocked_account_id, kind),
  CHECK (blocker_account_id <> blocked_account_id)
);

CREATE TABLE feed_definitions (          -- the feeds a viewer can choose
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  kind            TEXT NOT NULL CHECK (kind IN ('following', 'community', 'home_ranked',
                    'non_profiled', 'custom', 'external_generator')),
  owner_account_id UUID REFERENCES accounts (id),  -- null: the platform's own feeds
  name            TEXT NOT NULL,
  config          JSONB NOT NULL DEFAULT '{}',     -- sources, sort, filters, model version
  generator_uri   TEXT,                  -- a third-party generator's endpoint or DID
  profiled        BOOLEAN NOT NULL,      -- DSA Article 38: does it use profiling?
  status          TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'retired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'external_generator') = (generator_uri IS NOT NULL))
);

ALTER TABLE accounts
  ADD COLUMN feed_mode_id UUID REFERENCES feed_definitions (id);  -- the chosen default feed

CREATE TABLE feed_impressions (          -- what was served, where, why; partitioned by day
  served_at          TIMESTAMPTZ NOT NULL,
  request_id         UUID NOT NULL,
  viewer_account_id  UUID REFERENCES accounts (id),  -- null when logged out
  viewer_session     TEXT,               -- pseudonymous id for logged-out viewers
  feed_definition_id UUID NOT NULL REFERENCES feed_definitions (id),
  surface            TEXT NOT NULL,      -- 'home', 'related', 'notification', 'digest'
  content_item_id    UUID NOT NULL REFERENCES content_items (id),
  position           SMALLINT NOT NULL,
  candidate_source   TEXT NOT NULL,      -- 'in_network', 'graph_walk', 'embedding', ...
  model_version      TEXT,
  score              REAL,
  demotions          TEXT[],             -- policy demotions applied, by reason
  PRIMARY KEY (served_at, request_id, position)
) PARTITION BY RANGE (served_at);
```

Notes on the sketch:

- **One block table, read everywhere.** Feeds, search, chat, mentions, notifications and recommendations all filter on `blocks` in both directions; services cache each viewer's block set with explicit invalidation, because a block that takes minutes to apply is a harassment window.
- **Friend requests expire,** and the pair is stored once with an ordered key so neither side can create a duplicate.
- **Feed definitions are data,** including the platform's own feeds, so the non-profiled option is a row with `profiled = false` that every surface can be pointed at, and a user's choice survives releases. [Federation & Open Protocols](/books/user-generated-platforms/federation#how-to-build-it) registers third-party feed generators here.
- **Impressions are an analytics log,** partitioned and retained for a fixed window (long enough for training and for answering a regulator's or court's questions about what was recommended), with logged-out viewers pseudonymous ([Data Retention & Deletion](/docs/architecture/data-retention#retention-windows)). High-volume pipelines write them to the event stream and the warehouse rather than the transactional database ([Streaming](/docs/data/streaming)).
- **Per-viewer feed caches aren't tables.** Fan-out lists live in a cache keyed by viewer, rebuilt on miss; the record is the graph and the content.
- **Events:** `follow.created`, `follow.removed`, `friendship.requested`, `friendship.accepted`, `block.created`, `block.removed` and `feed.mode_changed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)); content life-cycle events from the core model trigger fan-out and removal sweeps.

## Auditing

- **What was recommended to whom, and why:** the impression log with candidate source, model version and demotions, for the retention window.
- **Model and value-model versions over time,** with the experiments that shipped them and their measured effects, because "when did the feed change?" is a question from users, creators, regulators and plaintiffs.
- **Feed mode choices and defaults,** per account and per age band and jurisdiction, so compliance with non-profiling and minors' rules can be shown, not asserted.
- **Graph changes that matter to safety:** blocks and their timing, friend requests to minors, and follows of minors by unknown adults ([Audit Trails](/docs/architecture/audit-trails)).
- **Recommendation notifications sent,** with the eligibility check result at send time ([The Message Log](/docs/architecture/notifications#the-message-log)).

## What This Means for the System You Build

- **Model follows, friendships, memberships, blocks and mutes as separate edges,** and enforce blocks in every service in both directions.
- **Use hybrid fan-out:** precompute lists for ordinary authors, merge high-follower authors at read time, and treat the lists as a cache.
- **Build the pipeline in stages:** several candidate sources, light and heavy ranking, policy filters, then mixing with diversity rules.
- **Re-check visibility at render,** after every cache and ranking step.
- **Mine the grouping graph** (boards, playlists, communities) for candidates, not only the follow graph.
- **Make the value model explicit,** count negative signals, and apply policy demotions as separate, recorded steps.
- **Ship a non-profiled feed as a first-class mode,** stored on the account and honored on every surface.
- **Design for logged-out readers:** related items per page, cached, with consent-aware personalization.
- **Reserve exploration** for new users, new items and new communities.
- **Budget recommendation notifications** per user with caps, quiet hours, consent and send-time checks.
- **Log every impression** with source, model version, position and demotions.

## References

**Law**

- [Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065), Article 27 (recommender system parameters in the terms and the control to choose and change the ordering) and Article 38 (at least one option not based on profiling for very large platforms)

**Papers**

- [Eksombatchai et al.: Pixie, a system for recommending 3+ billion items in real time (2017)](https://arxiv.org/abs/1711.07601), random walks on the pin-board graph, graph size, throughput and latency, engagement share and the effect of pruning
- [Ying et al.: Graph Convolutional Neural Networks for Web-Scale Recommender Systems (KDD 2018)](https://arxiv.org/abs/1806.01973), PinSage, graph size and training examples
- [Xia et al.: TransAct, a transformer-based real-time user action model (KDD 2023)](https://arxiv.org/abs/2306.00248), the real-time sequence plus batch embedding hybrid and its surfaces
- [Covington, Adams and Sargin: Deep Neural Networks for YouTube Recommendations (RecSys 2016)](https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/), two-stage candidate generation and ranking

**In practice**

- [X: the-algorithm repository](https://github.com/twitter/the-algorithm), candidate sources, in-network share from the search index, light and heavy rankers, visibility filters and the home mixer
- [NVIDIA: Pinterest GPU acceleration for recommenders](https://blogs.nvidia.com/blog/pinterest-gpu-acceleration-recommenders/), larger models on GPUs, the home feed engagement gain and the funnel from billions of images (vendor-written, 2022)
- [Bluesky: Custom feeds](https://bsky.network/docs/starter-templates/custom-feeds), feed generators returning post skeletons that the AppView hydrates
- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), logged-out visitors from search engines, ads on conversation pages and feeds, and the end of separate logged-in and logged-out reporting
- [Pinterest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000021/pins-20251231.htm), surfaces and ARPU by region
- [Pinterest: Teen safety on Pinterest](https://newsroom.pinterest.com/en-ca/news/teen-safety-on-pinterest/), private and non-discoverable accounts for younger teens
- [Discord: Adapting Discord for the UK Online Safety Act](https://discord.com/safety/adapting-discord-for-the-uk-online-safety-act), friend-request alerts and message requests keyed on mutual friends and shared servers
