+++
title = "Search"
description = "Product search: Postgres full-text and trigrams first, when to add a search engine, keeping it in sync, relevance, tenant filtering, hybrid search and quality."
category = "Building Blocks"
order = 457
tags = ["architecture", "search", "postgres", "full-text", "relevance", "vector-search"]
+++

Every product grows a search box: customers by name, orders by number, products by what they look like, help articles by the question someone typed. The box looks like one feature and is several: matching words despite their endings, forgiving typos, ranking the right result first, narrowing by facets, suggesting as people type, and never, under any circumstances, showing one tenant's records to another.

The common mistakes are at both ends. One team ships `ILIKE '%term%'` on a large table and wonders why search is slow and ranks nothing. Another stands up a search cluster on day one, then spends a year keeping it in sync with the database and explaining why a record created a second ago doesn't show up. My default: **start with PostgreSQL full-text search and trigrams, move to a dedicated engine when you can name the feature or the load that Postgres can't give you, and treat the index as a derived copy you can rebuild at any time.**

This chapter is the backend side. The API shape of a search parameter (`q`, kept apart from exact filters) is in [Filtering & Sorting](/docs/requests/filtering-and-sorting#search).

## Start in Postgres

PostgreSQL's full-text search parses text into normalized lexemes (a `tsvector`), parses the query into a `tsquery`, and matches the two with `@@`. It stems words by language, drops stop words, supports phrases and prefixes, ranks results, and indexes all of it with GIN. For a product's own records, that covers most search boxes.

```sql
ALTER TABLE articles ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'D')
  ) STORED;

CREATE INDEX CONCURRENTLY articles_search_vector_idx ON articles USING GIN (search_vector);

SELECT id, title, ts_rank_cd(search_vector, query, 32) AS rank
  FROM articles, websearch_to_tsquery('english', $2) AS query
 WHERE tenant_id = $1
   AND search_vector @@ query
 ORDER BY rank DESC, id
 LIMIT 20;
```

- **A stored generated column** keeps the vector in step with the row with no application code. The PostgreSQL docs list its advantages over an expression index: queries don't have to repeat the text search configuration to use the index, and matches don't need `to_tsvector` recomputed. The expression index is simpler and smaller; either works.
- **Name the configuration** (`'english'`) everywhere. An expression index can only use the two-argument `to_tsvector`, and a query that relies on `default_text_search_config` won't use it.
- **Weights carry field importance.** `setweight` labels lexemes `A` to `D` (the docs' example is "title versus body"), and the ranking functions weight them `{0.1, 0.2, 0.4, 1.0}` for `D` to `A` by default.
- **`websearch_to_tsquery` for user input.** It takes search-engine syntax (quoted phrases, `or`, `-` to exclude) and "will never raise syntax errors," so raw input from the box can go straight in.
- **`ts_rank_cd` rewards terms that appear near each other;** `ts_rank` counts frequency. The docs warn that ranking "can be expensive since it requires consulting the `tsvector` of each matching document," so rank inside a filtered set (one tenant, one record type), not across the table.
- **Snippets cost more than search.** `ts_headline` "uses the original document, not a `tsvector` summary, so it can be slow," and its output isn't safe to put in a page unescaped. Generate snippets for the 20 results shown, never for the match set, and escape them.

**Language is a per-field decision.** Stemming English rules over German text produces nonsense lexemes. Store the language with the record and index with a configuration per language (Postgres can take the configuration from a column, as long as queries use the same column), or use the `simple` configuration, which lowercases without stemming, for fields that aren't prose: names, codes, tags.

## Fuzzy Matching With Trigrams

Full-text search matches words. It won't find "Jonh" for "John," "acme" inside "acmecorp," or an order number from its middle digits. Those are the searches people type into admin tools and pickers most, and `pg_trgm` covers them.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY customers_name_trgm_idx ON customers USING GIN (name gin_trgm_ops);

-- typo-tolerant name lookup, best match first
SELECT id, name, similarity(name, $2) AS score
  FROM customers
 WHERE tenant_id = $1 AND name % $2
 ORDER BY score DESC, id
 LIMIT 10;

-- substring match that uses the same index
SELECT id, name FROM customers WHERE tenant_id = $1 AND name ILIKE '%' || $2 || '%';
```

A trigram is three consecutive characters; similarity is the share of trigrams two strings have in common, from 0 to 1, and `%` matches above `pg_trgm.similarity_threshold`, which defaults to 0.3. The same GIN or GiST index serves `LIKE`, `ILIKE` and regular expressions without a left anchor. For matching a short query against part of a longer string, `word_similarity` and its operators (default threshold 0.6) fit better than whole-string similarity.

My split: full-text search for prose (articles, descriptions, notes), trigrams for short identifying strings (names, emails, SKUs, addresses, reference numbers), and both combined when a box searches both. Exact identifiers (an email, an order number typed in full) get their own B-tree lookup first, because an exact match should always be the top result.

## When to Move to a Search Engine

A dedicated engine earns its place when you can point to one of these:

- **Relevance features Postgres doesn't have:** typo tolerance across prose, synonyms managed by non-engineers, per-language analyzers beyond stemming, custom scoring with popularity or recency, "did you mean," learning to rank.
- **Facets at volume.** Counts per brand, size, price band and color over millions of matches on every keystroke are expensive in SQL and a core operation in an engine.
- **Search load that competes with transactions.** Measured, not guessed ([Performance](/docs/database/performance#measure-first)). A read replica for search queries comes before a new system.
- **Search across sources** that don't share a database: records from several services, documents, help content.

| Engine | Shape | Fits |
| --- | --- | --- |
| **OpenSearch / Elasticsearch** | Distributed Lucene indexes, BM25 scoring by default, analyzers, aggregations, vector search, aliases | Large corpora, complex relevance, logs and analytics on the same cluster, teams who'll tune it |
| **Typesense** | Single binary that "stores the entire search index in-memory and a copy of the raw data on disk" | Product and catalog search with typo tolerance by default, sized by RAM |
| **Meilisearch** | Single binary with typo tolerance, facets and ranking rules configured, not coded | Instant search for apps and sites, small teams |

My default when Postgres runs out is a managed OpenSearch or Elasticsearch for anything large or relevance-heavy, and Typesense or Meilisearch when the need is fast, typo-tolerant search over a catalog that fits comfortably in memory. Either way, the database stays the source of truth.

## Keeping the Index in Sync

An external index is a derived copy, like a cache, and every hard problem is about keeping it honest.

- **Changes reach the index through the outbox or change data capture,** never a second write in the request handler. A dual write (database, then index) loses updates whenever the second call fails, and orders them wrongly when two requests race. Write an outbox row in the same transaction as the change, or stream the database's change log, and let an indexer apply them ([Events & Messaging](/docs/architecture/events#the-transactional-outbox)).
- **The indexer reads current state, not the event's payload.** On any change to a record, reload it (with its joins, custom fields and permissions) and write the whole document. Events that arrive twice or out of order then converge on the latest state, and the indexing code is the only place that knows the document's shape. Use the row's `version` as the engine's external version where supported, so a stale write can't overwrite a newer one.
- **Deletes are changes too.** A soft-deleted, merged or tenant-erased record must leave the index, and a document still searchable after an erasure request is a privacy incident, not a sync lag ([Data Retention](/docs/building-blocks/data-retention#erasure-requests)).
- **Full reindex is routine, not a crisis.** Mapping changes, analyzer changes and recovering from drift all mean rebuilding. Build a new index (`articles_v8`) from the database while the old one serves, replay the changes that arrived during the build, then point the alias at it. Elasticsearch's aliases API performs a remove and an add "in a single atomic operation," so the application only ever queries `articles` and never sees a half-built index.
- **Reconcile.** A nightly job compares counts and a sample of versions per tenant between the database and the index, and alerts on drift. Drift means some write path skipped the outbox.

**Consistency is eventual, so design the screens for it.** Elasticsearch refreshes indexes every second by default (only for indexes searched in the last 30 seconds), so a document is searchable "within 1 second" in the best case, and the indexer's own lag adds to that. A user who creates a record and lands on a list should see it: render that list from the database, or insert the new record into the results on the client, rather than forcing a refresh on every write.

## Relevance

Relevance is the order of the results, and it's the part users judge search by. The defaults are good; the work is in the fields and the words.

- **BM25 is the baseline.** It's the default similarity in Elasticsearch and OpenSearch: term frequency that saturates (parameter `k1`, default 1.2) and length normalization (`b`, default 0.75), so ten mentions aren't ten times better and a match in a short field counts for more. Leave the parameters alone until you have judgments to tune against (below).
- **Boost fields, not documents.** A match in the title or SKU outranks one in the body; a name match outranks a match in notes. Exact matches on identifiers rank above everything.
- **Analyzers per field and language.** An analyzer is character filters, one tokenizer and token filters (lowercasing, stop words, stemming, synonyms). Prose fields get a language analyzer; names, codes and emails get a keyword or lightly normalized analyzer, because stemming "Waters" to "water" is a bug in a name field. Normalize Unicode consistently at index and query time, so accented and unaccented spellings meet.
- **Synonyms at search time.** Elastic recommends search-time synonyms "because you can update your synonym sets without reindexing." Keep synonym sets as data owned by whoever owns the catalog, with one-way rules (`i-pod, i pod => ipod`) for spellings and equivalence rules for true synonyms.
- **Typo tolerance with limits.** Meilisearch's defaults are a useful model: one typo for terms of five or more characters, two for nine or more, and none on words or attributes you exclude. Turn it off for identifiers, where a near miss is a different order.
- **Business signals last.** Popularity, stock, recency or margin can break ties among relevant results. Mixed in too strongly, they bury the thing the person actually typed.

## Facets and Filters

Filters narrow; facets show how the matches distribute so a person can narrow further. Both are exact, not scored: a filter on `status = open` is a yes or no, applied before ranking, and an engine caches it separately from the scored query ([Filtering & Sorting](/docs/requests/filtering-and-sorting#filtering) for the parameter shape).

- **Index facet fields as keywords,** with stable values (option keys, not display labels), and map them to labels for display, the same rule as custom-field options ([Custom Fields](/docs/building-blocks/custom-fields#types-and-option-lists)).
- **Counts reflect the other selected filters,** not their own facet: choosing "red" shouldn't make "blue" show zero. Engines call these post filters or disjunctive facets; in SQL it's one count query per facet with that facet's own filter removed.
- **Price and date facets are ranges,** defined as buckets in configuration, not computed from the result set, so they don't jump around between queries.
- **Results paginate with a cursor or a capped depth.** Search results are a ranked list that shifts as data changes, and engines limit deep paging; offer the first few hundred results and better filters, not page 400 ([Pagination](/docs/requests/pagination#cursors-by-default)).

## Autocomplete

Suggestions as someone types are a different query from search: prefix matching on a few short fields, under a tight latency budget, many times per search.

- **A separate endpoint with its own index or fields,** built for prefixes: edge n-grams or a completion structure in an engine, `tsquery` prefix matching (`'acm':*`) or trigrams in Postgres.
- **Suggest things, not just strings.** "Acme Corp (customer)" and "ACME-1042 (order)" go straight to the record; plain query completions go to the results page.
- **Debounce on the client and cancel stale requests,** so a fast typist doesn't render the suggestions for "ac" after those for "acme."
- **Same tenant and permission filters as search.** Autocomplete leaks as readily as full search, faster.

## Tenants and Permissions in Results

A search index is a second copy of every tenant's data, outside the database's row-level security. Isolation has to be rebuilt there deliberately ([Multi-Tenancy](/docs/architecture/multi-tenancy#tenant-id-everywhere)).

- **The tenant filter is added by the search layer, never by the caller.** One function builds every query, and it adds `tenant_id` from the authenticated context the way the database layer does. A test sends a query with no tenant context and expects a refusal, not every tenant's results.
- **Shared index with a tenant field by default;** an index per tenant only for a few very large tenants or contractual isolation. Thousands of small indexes cost more in cluster overhead than they buy in isolation.
- **Authorization filters go into the query, before ranking.** Index the fields that decide visibility (owner, team, region, a restricted flag, a list of groups allowed to read) and filter on them in the query ([Authorization](/docs/security/authorization#where-checks-belong)). Filtering after the engine returns results breaks counts and pagination, and the facet counts themselves disclose what exists: "3 results in Legal" is a leak if the user can't open any of them.
- **Recheck on open.** The index is seconds or minutes behind permission changes. The record page checks authorization against the database, so a stale index can at most show a title, never the record.
- **Permission changes reindex.** Moving a record to a restricted team, or removing someone from a group whose access is indexed on documents, triggers reindexing of what it affects; group-based visibility is cheaper to index as group IDs on the document than as user IDs.

## Semantic and Hybrid Search

Keyword search finds what was typed; vector search finds what was meant. An embedding model turns text into a vector, and nearest neighbors in that space are semantically similar even with no word in common: "laptop won't turn on" finds "notebook doesn't power up." It's weak at exactly what keyword search is good at: names, codes, rare terms and exact phrases. So the strong default is both.

**pgvector keeps it in Postgres.** It adds a `vector` type and two approximate indexes. HNSW "has better query performance than IVFFlat (in terms of speed-recall tradeoff)" but builds slower and uses more memory; IVFFlat builds faster and needs data in the table before the index is created. Indexes cover vectors up to 2,000 dimensions (`halfvec` up to 4,000). Two traps:

- **Filters apply after the approximate scan.** With the default `hnsw.ef_search` of 40 and a filter that matches 10% of rows, pgvector's docs say "only 4 rows will match on average." Turn on iterative index scans, or partition and index per tenant, so tenant and permission filters don't starve the results.
- **Embeddings are derived data with a model version.** Changing the embedding model means re-embedding everything into a new column or index and switching over, exactly like a reindex.

**Hybrid search runs both queries and fuses the rankings.** Scores from BM25 and cosine distance aren't comparable, so fuse by rank, not score. Reciprocal rank fusion gives each document the sum of `1 / (k + rank)` over the lists it appears in, with `k` defaulting to 60 in Elasticsearch, and pgvector's docs recommend it (or a cross-encoder) for combining its results with full-text search:

```go tab="Go"
// Fuse merges ranked lists of IDs by reciprocal rank fusion. Each list is best
// first; k dampens the weight of top ranks (60 is the common default).
func Fuse(k float64, lists ...[]string) []string {
	scores := map[string]float64{}
	for _, list := range lists {
		for i, id := range list {
			scores[id] += 1 / (k + float64(i+1))
		}
	}
	ids := make([]string, 0, len(scores))
	for id := range scores {
		ids = append(ids, id)
	}
	sort.Slice(ids, func(a, b int) bool {
		if scores[ids[a]] != scores[ids[b]] {
			return scores[ids[a]] > scores[ids[b]]
		}
		return ids[a] < ids[b] // stable order for ties
	})
	return ids
}
```

```rust tab="Rust"
/// Merges ranked lists of IDs by reciprocal rank fusion. Each list is best
/// first; `k` dampens the weight of top ranks (60 is the common default).
pub fn fuse(k: f64, lists: &[Vec<String>]) -> Vec<String> {
    let mut scores: HashMap<&str, f64> = HashMap::new();
    for list in lists {
        for (i, id) in list.iter().enumerate() {
            *scores.entry(id.as_str()).or_default() += 1.0 / (k + (i + 1) as f64);
        }
    }
    let mut ids: Vec<(&str, f64)> = scores.into_iter().collect();
    ids.sort_by(|a, b| b.1.total_cmp(&a.1).then_with(|| a.0.cmp(b.0))); // stable order for ties
    ids.into_iter().map(|(id, _)| id.to_string()).collect()
}
```

Fetch more candidates from each side than you'll show (100 each for a page of 20), apply tenant and permission filters inside both queries, and fuse. Measure before and after: hybrid search is a relevance change like any other.

## Measuring Search Quality

Search quality that isn't measured drifts, and complaints arrive as "search is bad," which nobody can act on. Two kinds of measurement, both needed:

- **Online, from real queries.** Log each search (query text, filters, result count, the IDs shown, latency) and each click with its position. Track the **zero-result rate**, the **click-through rate** and the **click position**, the same metrics Algolia's analytics report: the share of searches with no results, the share with at least one click, and where in the list people click. Lower positions are better. Read the top zero-result queries every week; they're a list of missing synonyms, missing content and typos you don't tolerate.
- **Offline, from judgments.** Keep a set of real queries with graded judgments of which results are relevant, and score every relevance change against it before it ships. Elasticsearch's ranking evaluation API computes the standard metrics over such a set: precision and recall at k, mean reciprocal rank, discounted cumulative gain (normalized as nDCG) and expected reciprocal rank. A small set of a few hundred queries, refreshed from the logs, catches most regressions.
- **Search logs are personal data.** People type names, emails and worse into search boxes. Retain query logs on a schedule, keep them out of general analytics, and aggregate before sharing ([Data Retention](/docs/building-blocks/data-retention#retention-windows)).

## Checklist

- Postgres first: a weighted, generated `tsvector` with GIN for prose, `pg_trgm` for names and identifiers, exact lookups for exact identifiers.
- The text search configuration is named everywhere, per field and language; non-prose fields don't stem.
- A search engine arrives for a named feature or measured load, and the database stays the source of truth.
- The index is fed by the outbox or CDC, documents are rebuilt from current state with a version, deletes and erasures propagate, and full reindexes swap an alias.
- Screens tolerate seconds of index lag; the record page reads the database.
- Relevance: BM25 defaults, field boosts, analyzers per field, search-time synonyms as data, typo tolerance off for identifiers.
- Facets use stable keys and count against the other filters; deep paging is capped.
- Autocomplete is its own endpoint with the same tenant and permission filters.
- Tenant and authorization filters are added by one query builder, inside the query, before ranking and counts.
- Hybrid search fuses keyword and vector rankings with reciprocal rank fusion, with filters inside both queries.
- Zero-result rate, click-through and click position are tracked online; relevance changes are scored offline against judgments.

## References

**Reference**

- [PostgreSQL: Controlling Text Search](https://www.postgresql.org/docs/current/textsearch-controls.html), `setweight`, `ts_rank` and `ts_rank_cd`, default weights, `websearch_to_tsquery`, and the cost of ranking and `ts_headline`
- [PostgreSQL: Tables and Indexes (text search)](https://www.postgresql.org/docs/current/textsearch-tables.html), generated `tsvector` columns vs expression indexes, and naming the configuration
- [PostgreSQL: pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html), trigram similarity, the 0.3 and 0.6 default thresholds, and index support for `LIKE`, `ILIKE` and regular expressions
- [pgvector](https://github.com/pgvector/pgvector), HNSW vs IVFFlat, dimension limits, filtering with approximate indexes, and hybrid search with reciprocal rank fusion
- [Elasticsearch: Similarity settings](https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity), BM25 as the default with `k1` 1.2 and `b` 0.75
- [Elasticsearch: Anatomy of an analyzer](https://www.elastic.co/docs/manage-data/data-store/text-analysis/anatomy-of-an-analyzer), character filters, tokenizers and token filters
- [Elasticsearch: Search with synonyms](https://www.elastic.co/docs/solutions/search/full-text/search-with-synonyms), explicit and equivalent rules, and why search-time synonyms are recommended
- [Elasticsearch: Aliases](https://www.elastic.co/docs/manage-data/data-store/aliases), swapping an alias between indexes in one atomic request
- [Elasticsearch: Near real-time search](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search), the one-second refresh and the 30-second search condition
- [Elasticsearch: Reciprocal rank fusion](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion), the RRF formula and the default rank constant of 60
- [Elasticsearch: Ranking evaluation API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-rank-eval), offline judgments with precision, recall, MRR, DCG and ERR

**In practice**

- [Typesense: System requirements](https://typesense.org/docs/guide/system-requirements.html), the whole index in memory and RAM sized by the data
- [Meilisearch: Typo tolerance settings](https://www.meilisearch.com/docs/learn/relevancy/typo_tolerance_settings), one typo from five characters, two from nine, and disabling it on words and attributes
- [Algolia: Search analytics metrics](https://www.algolia.com/doc/guides/search-analytics/concepts/metrics/), no-results rate, click-through rate, conversion rate and click position
