+++
title = "Posts, Comments & Voting"
description = "Post types, reposts and quotes, threaded comments, removal versus deletion, votes and karma, hot and confidence ranking, vote manipulation and viral galleries."
category = "User-Generated Platforms Industry"
order = 1805
part = "Communities and Conversation"
tags = ["user-generated-content", "posts", "comments", "voting", "ranking"]
+++

Posts and comments are the inventory of a community platform, and votes are how the community prices them. A post goes up in a community, people reply, replies get replies, and every reader's up or down arrow (or heart, or like) feeds a score that decides what the next reader sees. The mechanics look simple and carry most of the product: the sort order of a comment thread decides whether a thoughtful reply or a fast joke wins, the ranking formula decides whether a community favors news or evergreen material, and the difference between "deleted" and "removed" decides whether a moderator's decision is visible to the people it affects.

They're also where manipulation pays. A vote is cheap to cast and valuable in aggregate, so vote rings, purchased upvotes, brigades from other communities and sockpuppet accounts follow any platform where votes move attention. The ranking design and the defenses have to be built together.

This chapter covers post types and reposts, threading and its storage, the content state machine with removal versus deletion, edits, labels for mature content, votes and karma, the published ranking formulas (hot, confidence, controversy), viral galleries, and vote manipulation. It extends `content_items` and `content_revisions` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) and adds votes, scores and labels. Feeds built from these scores are [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations); account farms and coordinated campaigns are [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#account-farms); image processing for media posts is [Images at Scale](/books/user-generated-platforms/images-at-scale).

## How the Platforms Do It

| Platform | Post shapes | Replies | Reactions | Default ranking |
| --- | --- | --- | --- | --- |
| **Reddit** | Text, link and media posts | Nested comment trees | Up and down votes; every item starts with the author's upvote; votes are anonymous | Hot, confidence and controversy sorts in its published code (below); current production ranking not public |
| **Imgur** | Gallery posts of one or more images | Nested comments | Up and down votes, favorites | A public gallery ranked by an algorithm over views, shares and votes with time, with "most viral" and user-submitted sections |
| **Tumblr** | Posts of several formats | Reblogs with added commentary, replies | Likes, reblogs | Following feed plus recommendations |
| **YouTube** | Videos, Shorts, community posts | Two-level comments | Likes and dislikes, with dislike counts private since November 2021 | Recommendation-driven |
| **Bluesky, Threads, X** | Short posts with media, quotes and reposts | Reply threads | Likes, reposts, quotes | Following and algorithmic feeds |

Two families emerge. **Forums vote:** Reddit and Imgur use up and down votes as a ranking signal inside a community or gallery, and the score is visible. **Social feeds react:** likes, reposts and quotes are signals for a personalized feed, and the count is social proof more than a rank. The data model below supports both; the next chapter, [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#what-the-feed-optimizes), decides how much each signal matters.

## Post Types

Every post type is a content item of kind `post` (or `media_post` when the media is the point) with a format that decides how it renders and what it carries:

- **Text** posts carry a title and a body in the revision.
- **Link** posts carry a URL, which brings link previews (a fetch the server makes on the user's behalf, with the [server-side request forgery](/docs/security/api-security#api7-2023-server-side-request-forgery) risk any URL fetcher has), domain-level spam rules, and copyright and malware questions about the target.
- **Image, gallery and video** posts carry media assets through `content_media`; one asset can sit in several posts, and the asset's pipeline (scanning, variants, GIF to video) is the Media part's ([The Upload Path](/books/user-generated-platforms/upload-path#scanning-before-publish), [Images at Scale](/books/user-generated-platforms/images-at-scale#gif-to-video)).
- **Polls** carry options and a closing time; each poll vote is one per account, kept apart from the item's up and down votes.
- **Crossposts, reblogs, reposts and quotes** point at another item. A crosspost or plain repost republishes the original into a new place; a reblog or quote adds the reposter's own text. Tumblr built its distribution on reblog chains, where each reblog can add commentary on top of the chain before it; Threads represents quote posts toward the fediverse with FEP-e232 object links and Misskey's `_misskey_quote` property, because ActivityPub has no formal quote-post specification ([Federation & Open Protocols](/books/user-generated-platforms/federation#large-platforms-joining)).

The repost rule that matters is **the original controls the copy.** When the original is removed or deleted, every repost and quote that embeds it must stop showing its content, whether it was reposted once or ten thousand times. Store the reference, never a copy of the original's text, and render the embedded post at read time through the same visibility checks as the original.

## Threads and Their Storage

A comment's `parent_id` is what it replies to and `root_id` is the post at the top of its thread; the core model already has both. Rendering a thread needs more: the tree in order, sorted per level by the thread's sort, with a depth limit and a "continue this thread" link below it. Four storage patterns are common, and community platforms mostly use the first two:

| Pattern | How it works | Fits |
| --- | --- | --- |
| **Adjacency list** | Each row points at its parent; read with a recursive query | Simple writes; fine when threads are fetched by root and sorted in the application |
| **Materialized path** | Each row stores its ancestry (`0001.0007.0003`) as a string or `ltree` | Subtree reads with one index range scan; depth is the path length |
| **Closure table** | A side table with every ancestor-descendant pair | Arbitrary subtree queries; writes cost a row per ancestor |
| **Nested sets** | Left and right numbers per node | Fast reads, expensive inserts; poor fit for live threads |

My default is adjacency plus a materialized path: the parent for integrity, the path for reading a subtree in one ordered scan. The sort inside a level (top, new, confidence, controversial) is applied when the thread is assembled, using the scores below; a path that encodes the sort would need rewriting on every vote. Very large threads are fetched in pages of top-level comments with a few levels of replies each, and the client asks for more on demand.

## States, Removal and Deletion

The core model's content states are the industry's vocabulary: `draft`, `pending_review`, `published`, `hidden`, `removed`, `deleted`. On a community platform the transitions mean specific things:

- **Pending review** is where a filter puts an item it isn't sure about: a community's automod rule, a new account's first post in a strict community, or a classifier score in the uncertain middle. Moderators approve or remove it ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#queues-logs-and-mail)).
- **Hidden** is a temporary state: collapsed by a spam filter, blurred behind a label, or held while a report is reviewed.
- **Removed** is a moderator's or the platform's decision. The author usually still sees their item (and a notice of why); everyone else sees a placeholder that says it was removed.
- **Deleted** is the author's own act. The placeholder says the author deleted it.

The distinction between removed and deleted is a product feature and a legal record, not a label. Readers can tell a community that removes dissent from an author who changed their mind; the author knows a moderator acted and can appeal; and the platform's transparency counts (removals by moderators versus by admins) are queries over these states. Reddit's report for the second half of 2025 counts 2,210,675,258 posts and comments created and 154,198,211 removed, 52.7% by moderators and 44.7% by admins.

Both are **tombstones, not holes.** A removed or deleted comment keeps its place in the tree so its replies still have a parent and the thread still reads; its text is cleared from what's served while the revisions stay as evidence for the retention period the [Data Retention & Deletion](/docs/architecture/data-retention#soft-vs-hard-delete) doc and any legal hold allow ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds)). Purges that remove content in bulk are [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#policy-driven-purges).

**Edits are revisions.** An edit adds a `content_revisions` row and moves the item's pointer; reports and decisions keep pointing at the revision they judged, so an author can't edit a reported post into innocence before a moderator looks. Showing that an item was edited (and, on some platforms, its history) is a trust feature; a short grace period after posting during which edits don't mark the item is common.

**Locking and pinning** are moderator controls on top of states: a locked thread takes no new replies, and a pinned post stays at the top of the community regardless of score. Archiving old threads (closing them to new comments and votes after a period) caps the surface spammers and manipulators can reach and lets scores freeze.

## Labels for Mature and Sensitive Content

A label says what a piece of content contains so readers and the platform can treat it differently: blurred, hidden, behind a click, unavailable to minors, or ineligible for ads. Labels come from four sources, and the model keeps them apart:

- **The author.** Tumblr's community labels, introduced in September 2022, let users tag their own posts for drug and alcohol addiction, violence and sexual content; readers choose to see labeled posts, see them behind a click-to-view, or block them; users under 18 can't see labeled content at all, and labeled posts can't be monetized through Tumblr's paid products. In the AT Protocol a record can carry self-labels, with the author's repository as the source and the record's version as the subject.
- **Moderators,** applying a label when the author didn't.
- **The platform,** from classifiers or review.
- **Third-party labelers,** on Bluesky, which [Federation & Open Protocols](/books/user-generated-platforms/federation#labels-and-stackable-moderation) covers.

Labels sit beside the item's `content_rating` from the core model: the rating is the platform's summary for gating (general, mature, adult), and labels are the specific reasons with their sources. A community's rating sets a floor; an item can be rated higher than its community but never lower.

## Votes and Karma

A vote is one account's judgment of one item: up, down, or withdrawn. The design questions:

- **Up and down, or up only.** Downvotes let a community bury spam and low-effort replies, and they invite pile-ons. YouTube made public dislike counts private on November 10, 2021, after an experiment found that hiding the count reduced "dislike attacks" in which people try to inflate a video's dislikes; the button stayed, feeding recommendations and private feedback, and creators still see the total.
- **The author's own vote.** Reddit's 10-K states that every post or comment starts with one upvote, the author's, so a new item's score is 1, not 0.
- **Anonymity.** Reddit's votes are anonymous to other users. The platform still knows who voted, which it needs to discount manipulation, and which is personal data (a vote on a post in a health or political community says something about the voter). Reddit has also used vote records for safety: its transparency report for the second half of 2025 describes a feature that warns users who upvoted content later found to violate its violence policy, with warnings dropping off quickly after an initial spike.
- **Exact or approximate counts.** An exact, instantly updated score lets a manipulator measure each fake vote's effect. Showing a rounded or slightly delayed count, and computing the ranking from a score that discounts suspect votes, makes the feedback loop slower without changing what honest users see.

**Karma** is an account's accumulated score, a reputation summary that communities use as a gate: a minimum karma or account age to post, comment or message is one of the most common automod rules, because farmed accounts are young and low-karma. Some platforms have also used it as a payout input. A number that gates access or pays money will be farmed, so treat karma as derived from votes that survived manipulation checks, recompute it when votes are discounted, and never let it be the only gate. Payout programs are [Creator Monetization](/books/user-generated-platforms/creator-monetization#the-spread)'s.

## Ranking Formulas

Reddit published its sort functions in its open-source codebase, and they remain the clearest public reference for ranking voted content. How Reddit ranks today isn't public; the formulas are worth knowing because every community platform needs a version of each.

**Hot** ranks by score and age together:

```text
s     = ups - downs
order = log10(max(|s|, 1))
sign  = 1 if s > 0, -1 if s < 0, else 0
hot   = round(sign * order + (posted_at_epoch - 1134028003) / 45000, 7)
```

Two choices carry the design. The score enters as a logarithm, so the first 10 votes count as much as the next 90 and the next 900; and age enters linearly in units of 45,000 seconds (12.5 hours). A post needs ten times the net score to keep its rank against a post 12.5 hours newer. The constant 1134028003 is an epoch offset (December 2005) that keeps the numbers small; because time is measured from a fixed point rather than from now, a post's hot value never changes unless its votes do, so the list can be kept in an index and only re-sorted on votes. Tuning the 45,000 changes a community's character: smaller favors news, larger favors durable posts.

**Confidence** ("best") ranks by the lower bound of the Wilson score interval for the share of upvotes:

```text
n = ups + downs;  if n = 0: 0
p = ups / n
z = 1.281551565545            # 80% confidence
confidence = (p + z²/(2n) - z * sqrt(p(1-p)/n + z²/(4n²))) / (1 + z²/n)
```

It answers "how good is this comment at least, given how few votes it has?" A comment with 10 up and 0 down beats one with 1 up and 0 down, because the second could easily be a fluke, and a comment with 900 up and 100 down beats one with 50 up and 1 down only if its larger sample makes its lower bound higher. Evan Miller's 2009 essay "How Not To Sort By Average Rating" made the case against net score (which favors whatever had the most traffic) and average (which favors one lucky vote), and the Wilson lower bound spread to Reddit and other sites from it. Confidence ignores age, which is right for comments inside one thread and wrong for a front page.

**Controversy** finds items that split the voters:

```text
if ups <= 0 or downs <= 0: 0
balance     = downs / ups if ups > downs else ups / downs
controversy = (ups + downs) ** balance
```

An item with 500 up and 500 down scores 1,000; one with 1,000 up and 10 down scores about 1.07. It's a sort readers choose, rarely a default.

My rule for a new platform: ship hot for community front pages, confidence for comments, new and top-by-period as options, and keep the scores in a derived table recomputed from votes, so changing a constant or discounting a vote ring is a recompute, not a migration.

## Viral Galleries

An image host's public gallery is a front page fed by uploads from anyone, and its ranking is about velocity: how fast a post gathers views, votes and shares relative to its age and to what's normal for its section. Imgur's public gallery is described as ranked by an algorithm computing views, shares and votes over time, with a "most viral" section beside a "user submitted" one where new posts are tried out. The pattern generalizes:

- **A proving ground.** New posts enter a "new" or "rising" pool seen by a small share of readers; those that outperform the pool's baseline in the first hours graduate to the main gallery. The baseline is per section and per hour of day, because a post at 3 a.m. gets fewer votes for reasons that have nothing to do with quality.
- **Views as the denominator.** Votes per view is a better quality signal than raw votes, and it needs view counting that discounts bots and repeated views, the same logged-out and bot filtering a platform's usage metrics need.
- **Decay.** Galleries replace their front page several times a day; a hot-style time term with a short half-life does that.
- **The gallery is where manipulation pays most.** A post that reaches the main gallery gets orders of magnitude more views, so the proving ground is where vote-ring detection has to run first.

## Vote Manipulation

Manipulation takes four common forms: **self-voting with alternate accounts** (sockpuppets), **vote rings** (groups that agree to upvote each other), **purchased votes** from account farms, and **brigading** (members of one community descending on another to vote or comment). The defenses work in layers:

- **Make the vote cheap to discount.** Votes are rows with the account, item, value and time, so a later finding can zero a set of votes and recompute scores and karma. A vote ring found tomorrow should be undone tomorrow, not live forever in a counter.
- **Weight by trust.** New, unverified or low-standing accounts' votes can count less (or not at all) toward ranking while still counting for the voter's own feed, which costs honest new users nothing visible.
- **Watch the graph, not the vote.** One vote is never suspicious; the same accounts voting on the same author's posts within minutes of posting, votes arriving from a link posted elsewhere, and accounts that only ever vote are. Detecting them is the linked-accounts and coordination work of [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#vote-rings-and-manipulation), fed by `votes` and the referrer of each vote's session.
- **Enforce on accounts.** Reddit lists persistent vote manipulation among the reasons for automated permanent bans in its transparency report for the second half of 2025.
- **Reduce the payoff.** Rounded counts, archived old threads, karma gates on posting and slower graduation from rising to front page all shrink what a fake vote buys.

Brigading also has a community-governance answer: communities that link to others' threads can be required to use links that don't allow voting or commenting from the referral, and the moderators of the target community need tools to see that a surge came from elsewhere ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation)). Crowd-sourced context on misleading posts (Community Notes and its bridging algorithm) is covered in [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#crowd-context).

## How to Build It

The chapter's additions to the core model:

```sql
CREATE EXTENSION IF NOT EXISTS ltree;

ALTER TABLE content_items
  ADD COLUMN format          TEXT CHECK (format IN ('text', 'link', 'image', 'gallery',
                               'video', 'poll', 'repost', 'quote')),
  ADD COLUMN link_url        TEXT,
  ADD COLUMN reposted_item_id UUID REFERENCES content_items (id),  -- repost, quote, crosspost
  ADD COLUMN thread_path     LTREE,      -- root.child.grandchild, for subtree reads
  ADD COLUMN depth           SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN locked_at       TIMESTAMPTZ,
  ADD COLUMN pinned_at       TIMESTAMPTZ,
  ADD COLUMN archived_at     TIMESTAMPTZ,
  ADD COLUMN removed_by      TEXT CHECK (removed_by IN ('moderator', 'platform', 'automod')),
  ADD CONSTRAINT content_items_link CHECK (format <> 'link' OR link_url IS NOT NULL),
  ADD CONSTRAINT content_items_repost
    CHECK (format NOT IN ('repost', 'quote') OR reposted_item_id IS NOT NULL),
  ADD CONSTRAINT content_items_removed_by
    CHECK ((state = 'removed') = (removed_by IS NOT NULL));

CREATE INDEX content_items_thread ON content_items USING GIST (thread_path);

CREATE TABLE votes (                     -- one current vote per account per item
  content_item_id UUID NOT NULL REFERENCES content_items (id),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  value           SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  weight          NUMERIC(4, 3) NOT NULL DEFAULT 1,  -- trust weight for ranking
  discounted_at   TIMESTAMPTZ,           -- set when manipulation checks void it
  discount_reason TEXT,                  -- 'vote_ring', 'alt_account', 'brigade', ...
  session_ref     TEXT,                  -- referrer and session, for coordination checks
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_item_id, account_id)
);

CREATE TABLE content_scores (            -- derived; recomputable from votes at any time
  content_item_id UUID PRIMARY KEY REFERENCES content_items (id),
  ups             INT NOT NULL DEFAULT 0,
  downs           INT NOT NULL DEFAULT 0,
  views           BIGINT NOT NULL DEFAULT 0,
  hot             DOUBLE PRECISION NOT NULL,
  confidence      DOUBLE PRECISION NOT NULL,
  controversy     DOUBLE PRECISION NOT NULL,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE content_labels (            -- what content contains, and who said so
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  content_item_id UUID NOT NULL REFERENCES content_items (id),
  value           TEXT NOT NULL,         -- 'sexual', 'graphic_violence', 'drugs', 'spoiler', ...
  source          TEXT NOT NULL CHECK (source IN ('author', 'moderator', 'platform',
                    'labeler')),
  applied_by      UUID REFERENCES accounts (id),
  revision_id     UUID REFERENCES content_revisions (id),  -- the version it describes
  negated_at      TIMESTAMPTZ,           -- withdrawn without deleting the history
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE poll_options (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  content_item_id UUID NOT NULL REFERENCES content_items (id),
  position        SMALLINT NOT NULL,
  label           TEXT NOT NULL,
  UNIQUE (content_item_id, position)
);

CREATE TABLE poll_votes (
  content_item_id UUID NOT NULL REFERENCES content_items (id),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  poll_option_id  UUID NOT NULL REFERENCES poll_options (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_item_id, account_id)
);

CREATE VIEW account_karma AS             -- derived reputation; never a stored counter
SELECT ci.author_account_id AS account_id,
       ci.community_id,
       SUM(v.value * v.weight) FILTER (WHERE v.discounted_at IS NULL
                                       AND v.account_id <> ci.author_account_id) AS karma
  FROM votes v
  JOIN content_items ci ON ci.id = v.content_item_id
 GROUP BY ci.author_account_id, ci.community_id;
```

The ranking functions, as the database computes them when it refreshes `content_scores`:

```sql
CREATE FUNCTION hot(ups INT, downs INT, posted_at TIMESTAMPTZ)
RETURNS DOUBLE PRECISION LANGUAGE sql IMMUTABLE AS $$
  SELECT round((sign(ups - downs) * log(greatest(abs(ups - downs), 1))
          + (extract(epoch FROM posted_at) - 1134028003) / 45000)::numeric, 7)::float8
$$;

CREATE FUNCTION confidence(ups INT, downs INT)
RETURNS DOUBLE PRECISION LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN ups + downs = 0 THEN 0 ELSE
    (p + z*z/(2*n) - z * sqrt(p*(1-p)/n + z*z/(4*n*n))) / (1 + z*z/n) END
  FROM (SELECT (ups + downs)::float8 AS n,
               ups::float8 / nullif(ups + downs, 0) AS p,
               1.281551565545::float8 AS z) k
$$;

-- one page of a thread: top-level comments by confidence, three levels of replies each
SELECT c.id, c.parent_id, c.depth, c.state, r.body, s.confidence
  FROM content_items c
  JOIN content_revisions r ON r.id = c.current_revision_id
  JOIN content_scores s    ON s.content_item_id = c.id
 WHERE c.root_id = $1
   AND c.depth <= 3
   AND c.thread_path <@ ANY ($2::ltree[])  -- the subtrees of this page's top-level comments
 ORDER BY c.thread_path;                   -- the application sorts siblings by confidence
```

Notes on the sketch:

- **Scores are derived.** `content_scores` is refreshed from `votes` (incrementally on each vote, fully on a schedule and after any discount), so manipulation clean-up, a new constant or a changed trust weight is a recompute. Votes on `removed` or `deleted` items stop counting toward karma when the policy says so.
- **The author's starting vote is a row,** not a special case, so the score is honest about where its first point came from, and karma excludes self-votes.
- **Tombstones keep the tree.** A removed or deleted comment keeps its row, path and children; the read path serves a placeholder chosen by `state` and `removed_by`.
- **Labels are rows with sources,** so an author's label, a moderator's override and a labeler's opinion can coexist and be withdrawn individually; [Federation & Open Protocols](/books/user-generated-platforms/federation#how-to-build-it) adds the labeler reference.
- **Reposts hold references.** Rendering a repost reads the original through its visibility checks every time.
- **Events:** `content.published`, `content.edited`, `content.removed`, `content.deleted`, `content.restored`, `content.locked`, `vote.cast` (sampled or batched, never one event per vote on a viral post), `votes.discounted` and `label.applied` go through the outbox to feeds, search, notifications and moderation ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every revision of every item,** so a report, an appeal or a court sees the version that was judged.
- **Who removed what, as what:** the moderator or system, the community or platform scope, and the rule, kept beside the tombstone ([Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions)).
- **Every vote discount,** with the finding behind it, the votes affected and the scores and karma recomputed, because a creator whose post lost its rank will ask why.
- **Label history,** including negations, with source and the revision described.
- **Ranking configuration over time:** the constants and weights in force when an item ranked, so a sudden change in what a community sees can be traced to a release.

## What This Means for the System You Build

- **Model post formats on one content item,** with media, links, polls and reposts as attachments and references, not separate tables per type.
- **Store reposts and quotes as references** and render them through the original's visibility checks.
- **Use adjacency plus a materialized path** for threads, and sort siblings at read time.
- **Distinguish removed from deleted,** keep both as tombstones, and show readers which happened.
- **Make edits revisions** and pin reports and decisions to the revision they judged.
- **Keep labels as sourced rows** beside a content rating used for gating.
- **Store every vote as a row** with weight and discount fields, and derive scores and karma from them.
- **Ship hot, confidence and controversy** from the published formulas, with constants as configuration.
- **Give galleries a proving ground** and measure votes per view against a per-section baseline.
- **Detect manipulation on the graph of votes,** discount retroactively, and shrink the payoff with gates and rounded counts.

## References

**Reference**

- [Reddit: archived source code, `_sorts.pyx`](https://github.com/reddit-archive/reddit/blob/master/r2/r2/lib/db/_sorts.pyx), the hot, confidence and controversy functions and their constants
- [Evan Miller: How Not To Sort By Average Rating](https://www.evanmiller.org/how-not-to-sort-by-average-rating.html), the case against net score and average and for the Wilson lower bound (2009), and its adoption by Reddit and others
- [AT Protocol: Labels](https://atproto.com/specs/label), self-labels carried on records with the repository as source
- [Meta Engineering: Threads has entered the fediverse](https://engineering.fb.com/2024/03/21/networking-traffic/threads-has-entered-the-Fediverse/), quote posts through FEP-e232 and `_misskey_quote`, and the lack of a formal quote-post specification (March 21, 2024)

**In practice**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), every post and comment starting with one upvote, anonymous voting, community-driven visibility
- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), posts and comments created and removed, removals by moderators and admins, warnings to users who upvoted violent content, persistent vote manipulation as a ground for automated bans
- [YouTube: An update to dislikes on YouTube](https://blog.youtube/news-and-events/update-to-youtube/), private dislike counts and dislike attacks (November 10, 2021)
- [TechCrunch: Tumblr community labels](https://techcrunch.com/2022/09/27/tumblr-bring-back-porn-nsfw-community-labels), label categories, reader choices, under-18 restrictions and monetization limits (September 2022)
- [Wikipedia: Imgur](https://en.wikipedia.org/wiki/Imgur), the public gallery ranked by views, shares and votes over time, and its viral and user-submitted sections
