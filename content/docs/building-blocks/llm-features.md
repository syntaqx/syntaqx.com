+++
title = "LLM Features"
description = "Summaries, extraction, classification, drafts and answers inside a product: structured outputs, retrieval, evals as tests, latency, cost and fallbacks."
category = "Building Blocks"
order = 470
tags = ["architecture", "ai", "llm", "rag", "evals"]
+++

Most uses of a language model in a product don't act on anything. They summarize a support thread for the agent picking it up, pull the invoice number and due date out of an emailed PDF, sort an incoming ticket into a queue, draft a reply for a person to edit, or answer a question from the help center with links to the articles. Each is a function: text in, something useful out. And each fails in ways ordinary functions don't. The same input gives a different answer tomorrow, a provider upgrade changes behavior without a deploy, a confident answer cites a document that says the opposite, and the bill grows with traffic in a way nobody budgeted.

The shape that holds up: **the model call is a dependency behind a typed interface; its output is validated like untrusted input; quality is measured by evals that run like tests; and the feature still works, in a reduced form, when the model doesn't.** Agents that take actions through tools are a different design problem, covered in [AI Agents in the Product](/docs/building-blocks/ai-agents). Prompt injection and the rest of the threat model are in [AI & LLM Security](/docs/security/ai-security), which this chapter assumes rather than repeats.

## Choose Features by the Cost of Being Wrong

Every model output is sometimes wrong. The design question isn't whether, it's who notices and what it costs.

| Feature | When it's wrong | Design |
| --- | --- | --- |
| Summary of a ticket thread for an agent | The agent reads the thread anyway | Ship with evals and a feedback button |
| Ticket classification into queues | A ticket lands in the wrong queue and gets moved | Automatic, with a confidence threshold below which it goes to triage |
| Extraction from an emailed invoice | A wrong amount is paid | Pre-fill a form a person confirms, every field linked to where it came from |
| Drafted customer reply | The customer gets a wrong promise | Draft only; a person sends it |
| Help center answer | The customer acts on bad advice | Answer only from retrieved sources, cite them, say "I don't know" otherwise |

My rule: **the model proposes, and the cost of error decides who disposes.** A cheap mistake can be automatic. An expensive one gets a person, with the model's output shown as a draft and its sources one click away. That rule shapes the UI more than the prompt does.

## Structured Outputs, Then Validation

A feature that needs fields (a category, an amount, a date) asks for JSON against a schema, never prose it then parses with regular expressions. All three major providers constrain output to a JSON Schema:

- **Anthropic** says structured outputs "constrain Claude's responses to follow a specific schema" through constrained decoding, while noting it guarantees compliance "in most cases": a refusal "takes precedence over schema constraints," and output cut off at `max_tokens` "might be incomplete and not match your schema." Some schema features (numeric minimums and maximums, string lengths, recursive schemas) aren't supported.
- **OpenAI** distinguishes Structured Outputs from JSON mode: both produce valid JSON, but "only Structured Outputs ensure schema adherence." A refusal arrives in a separate `refusal` field and "does not necessarily follow the schema."
- **Google's** Gemini documentation says that "while output is syntactically correct JSON, always validate values in your application."

Constrained decoding makes the output parse. It doesn't make it right. So the result goes through the same validation any untrusted input would ([AI & LLM Security](/docs/security/ai-security#design-rules)): check why generation stopped, parse strictly, then check the values the schema couldn't express.

```go tab="Go"
// ParseTriage turns a completion into a Triage, or ErrInvalid. Constrained
// decoding makes the JSON parse; it doesn't make the values right.
func ParseTriage(c Completion, sentences int) (Triage, error) {
	if c.StopReason != "end" { // a refusal or a truncated answer may not match the schema
		return Triage{}, fmt.Errorf("%w: stop reason %q", ErrInvalid, c.StopReason)
	}
	var t Triage
	dec := json.NewDecoder(bytes.NewReader([]byte(c.Text)))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&t); err != nil {
		return Triage{}, fmt.Errorf("%w: %v", ErrInvalid, err)
	}
	if !slices.Contains(categories, t.Category) || !slices.Contains(urgencies, t.Urgency) {
		return Triage{}, fmt.Errorf("%w: unknown category or urgency", ErrInvalid)
	}
	if len(t.Summary) == 0 || len(t.Summary) > 280 {
		return Triage{}, fmt.Errorf("%w: summary length %d", ErrInvalid, len(t.Summary))
	}
	for _, i := range t.CitedSpans {
		if i < 0 || i >= sentences { // a citation to a sentence that doesn't exist
			return Triage{}, fmt.Errorf("%w: cited span %d out of range", ErrInvalid, i)
		}
	}
	return t, nil
}
```

```rust tab="Rust"
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Triage {
    pub category: Category, // an enum: an unknown value fails to parse
    pub urgency: Urgency,
    pub summary: String,
    pub cited_spans: Vec<usize>, // indexes into the message's sentences
}

/// Turns a completion into a Triage, or Invalid. Constrained decoding makes
/// the JSON parse; it doesn't make the values right.
pub fn parse_triage(c: &Completion, sentences: usize) -> Result<Triage, Invalid> {
    if c.stop_reason != StopReason::End {
        // A refusal or a truncated answer may not match the schema.
        return Err(Invalid(format!("stop reason {:?}", c.stop_reason)));
    }
    let t: Triage = serde_json::from_str(&c.text).map_err(|e| Invalid(e.to_string()))?;
    if t.summary.is_empty() || t.summary.len() > 280 {
        return Err(Invalid(format!("summary length {}", t.summary.len())));
    }
    if let Some(i) = t.cited_spans.iter().find(|&&i| i >= sentences) {
        // A citation to a sentence that doesn't exist.
        return Err(Invalid(format!("cited span {i} out of range")));
    }
    Ok(t)
}
```

- **Normalize providers at the adapter.** Each provider names its stop reasons, refusals and usage fields differently. One adapter per provider maps them to one `Completion` shape, so the feature code and the evals never see a vendor's field names.
- **Invalid output is a counted outcome,** not an exception that disappears in a log. One retry is reasonable; after that the feature degrades (below). A rising invalid rate after a model change is an eval failure you caught in production.
- **Ask for evidence in the schema.** For extraction, a field for where each value came from (a page and line, a sentence index); for classification, the sentence that decided it. Then validate that the evidence exists and show it to the person reviewing.

## Retrieval

When the answer depends on your data (help articles, a customer's own documents, policy text), the model needs that data in its context. Retrieval-augmented generation finds the relevant pieces and puts them in the prompt.

**First check whether you need retrieval at all.** Anthropic's guidance is that for a knowledge base "smaller than 200,000 tokens (about 500 pages of material)," you can include the whole thing in the prompt, and prompt caching (below) makes that affordable. A product's help center often fits. Retrieval adds an index, a pipeline and a new way to be wrong; skip it until the corpus outgrows the context.

When you do need it:

- **Chunk on structure, with context.** Split on headings and paragraphs, not every N characters, and keep each chunk's title path ("Billing › Refunds › Annual plans") with it. Anthropic's contextual retrieval experiments, which prepend a short generated description of where each chunk sits in its document, report that contextual embeddings plus contextual BM25 "reduced the top-20-chunk retrieval failure rate by 49%," and 67% with reranking added.
- **Hybrid by default.** The same experiments found "Embeddings+BM25 is better than embeddings on their own." Keyword search catches the product names, error codes and SKUs that embeddings blur; [Search](/docs/building-blocks/search#semantic-and-hybrid-search) covers running both and fusing the rankings with reciprocal rank fusion. A reranking pass over the fused candidates is the next lever.
- **Retrieve more than you think, then trim.** Anthropic found passing "the top-20 chunks to the model is more effective than just the top-10 or top-5." Measure it for your corpus, because long contexts have their own failure: in the "Lost in the Middle" study, performance was "often highest when relevant information occurs at the beginning or end of the input context" and degraded for information in the middle. Put the strongest chunks first.
- **Permissions are applied in the query.** A retrieved chunk is shown to the user through the model's answer, so retrieval must never return what the user can't open. Tenant and permission filters go into the retrieval query before ranking, by the same rules as [Tenants and Permissions in Results](/docs/building-blocks/search#tenants-and-permissions-in-results); OWASP lists vector and embedding weaknesses, including retrieval that leaks across users, as LLM08 ([AI & LLM Security](/docs/security/ai-security#the-owasp-top-10-for-llm-applications-2025)). The model is not a permission check; telling it "only use documents the user may see" is a suggestion.
- **Citations are verified, not trusted.** Give every chunk an ID, require the answer to cite IDs, and check that every cited ID was in the context you sent. Render citations as links to the source, so a reader can check the claim in one click. An answer with no valid citation for a factual claim is treated as "I don't know."
- **Embeddings are derived data with a model version.** Re-embedding on a model change, keeping the index in sync with edits and deletes, and deleting a document's chunks when the document is deleted are the indexing problems [Search](/docs/building-blocks/search#keeping-the-index-in-sync) already solves.

## Choosing and Routing Models

Pick the model per task, not per company. Classification and extraction from short text often run as well on a small, fast, cheap model as on the largest one; drafting long replies and reasoning over many retrieved sources may need a larger one. The eval set (next section) decides, not a leaderboard.

- **Pin dated model versions** where the provider offers them, and treat a version change as a release that runs the full eval suite. An alias that silently moves to a new model is a behavior change you didn't ship.
- **Route by task in config,** not code: `ticket_triage → small model, provider A`, `reply_draft → large model, provider A`, with a fallback per task. Changing a route is a reviewed config change behind a [feature flag](/docs/delivery/feature-flags).
- **Keep a second provider qualified** for the features that matter, with its own prompt variants and eval results. "We could switch" is only true if you've measured the other model on your tasks recently.
- **Escalate by difficulty when it pays.** Send everything to the small model, and only what fails validation or falls below a confidence threshold to the large one. Measure whether the escalation rate makes it cheaper; sometimes it doesn't.

## Evals Are Tests

A prompt edit, a model upgrade, a new retrieval setting: each changes behavior, and none shows up in a diff of what users will see. Evals are the tests that do. [AI Agents in the Product](/docs/building-blocks/ai-agents#evals) covers building scenario sets from real conversations; for features, the same idea gets simpler, because the output is usually a value you can check.

- **A golden set per feature.** A few hundred real inputs (consented, redacted) with expected outputs: the right category, the right extracted fields, the facts a good summary must mention. Add every production failure someone reports, so a fixed bug stays fixed. Include the hard cases on purpose: empty input, very long input, another language, an input that tries to change the instructions.
- **Grade in code wherever the output allows it.** Exact match on categories, field-level accuracy on extraction, citation validity, schema validity, length limits. These are cheap, deterministic and fast enough to run on every change.
- **LLM-as-judge for what code can't grade,** with care. The study that popularized it found strong judges reach "over 80% agreement" with human preferences, and also documented "position, verbosity, and self-enhancement biases, as well as limited reasoning ability." So: grade against a rubric with specific criteria rather than "which is better," randomize or swap the order in pairwise comparisons, don't let a model judge its own family's output where you can avoid it, and calibrate the judge against a few hundred human-labeled examples before trusting its scores. Recalibrate when the judge model changes.
- **Regression in CI.** Prompt and routing changes run the eval suite in the pipeline and fail on a drop beyond a set tolerance, like any other test. Models aren't deterministic, so compare rates across the set, not single outputs, and run the set enough times to know your noise.
- **Online, measure what users do.** Accept, edit and discard rates on drafts; re-routing rate on classifications; corrections to extracted fields. A prompt change that should help is an A/B test with guardrail metrics ([Experimentation](/docs/telemetry/experimentation#guardrail-metrics)).

## Prompts Are Versioned Code

The prompt is part of the program. It lives in the repository next to the code that calls it, reviewed like code, with a version ID that travels with every call.

- **Every result records its versions:** model, prompt version, retrieval index version. When a summary is wrong, you need to know which combination produced it, and when quality drops on Tuesday, which release did it.
- **Templates are data, instructions are code.** User content goes in clearly delimited data sections, never concatenated into instructions; how much that protects you is in [AI & LLM Security](/docs/security/ai-security#prompt-injection-is-unsolved).
- **Roll out like code.** A new prompt version ships behind a flag to a slice of traffic, with evals passed and online metrics compared before it becomes the default.
- **Results that persist get an audit trail.** A classification that routed a ticket, an extracted amount that pre-filled a payment: record the model and prompt version and who confirmed it, as [Audit Trails](/docs/building-blocks/audit-trails#automated-and-ai-decisions) describes for automated decisions.

## Latency

A model call is the slowest dependency most products have, and its latency grows with both the input and the output.

- **Stream anything a person reads.** Time to first token, not total time, is what the user feels on a summary or a draft. Stream into the UI, and design the UI for it: text that grows in place, a stop button, no layout jumps.
- **Don't stream what code consumes.** A classification or extraction is useless until it's complete and validated. Run it in the background where the product allows it (classify on ticket creation, not when the agent opens the ticket), so the user never waits.
- **Every call has a deadline,** set from the user's patience, not the provider's maximum, with the fallback path ready when it passes ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#every-call-has-a-timeout)).
- **Shorter prompts are faster prompts.** Retrieval that sends 20 relevant chunks instead of 80 cuts latency and cost at once. Prompt caching helps here too: OpenAI's documentation says caching can "reduce the time spent processing input before the response starts."
- **Trace it.** Model calls get spans with model, token counts and time to first token, using the [GenAI conventions](/docs/observability/opentelemetry#genai-calls), inside the request's [trace](/docs/observability/tracing), so a slow page shows whether retrieval or generation was slow.

## Cost

Token costs scale with traffic, prompt size and output length, and a feature that's cheap in a demo can be the largest line on the bill after launch.

- **Account tokens per feature and per tenant.** Input, cached input and output tokens on every call, attributed to the feature and the tenant, so cost per unit (per ticket summarized, per document extracted) sits on the same dashboard as the feature's usage ([Cost & FinOps](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total)).
- **Put stable content first and cache it.** Instructions, examples and shared reference material at the start, the per-request content at the end. Anthropic prices cache reads at "0.1 times the base input tokens price" for most models, with cache writes at 1.25 times for the default five-minute lifetime and 2 times for one hour, and requires "100 percent identical prompt segments" up to the cache marker. OpenAI caches automatically ("prompt caching is enabled by default for supported OpenAI models") for prompts of at least 1,024 tokens on current models and tells you to "put stable developer instructions and shared reference material first." A timestamp at the top of the system prompt defeats both.
- **Batch what isn't interactive.** Backfills, nightly re-classification and eval runs go through batch APIs: Anthropic's Message Batches cut costs "by 50 percent," with most batches finishing in under an hour and results available once every request completes or after 24 hours, whichever comes first.
- **Budget per tenant and per user.** Token budgets and rate limits per tenant and per user bound what a heavy user or an abusive one can spend ([Rate Limiting](/docs/requests/rate-limiting)). A budget that's exhausted degrades the feature for that tenant, not the whole product.
- **Cap output.** Set `max_tokens` from what the feature needs. A summary that should be three sentences doesn't need a 4,000-token ceiling, and a runaway generation is both slow and billed.

## When the Model Isn't There

Providers have outages, rate limits and slow days, and a feature built on one inherits all of them. Design the failure path before the first launch.

![An LLM feature call path: a versioned prompt with a stable prefix goes to the primary model, streamed with a deadline, then to validation of schema, refusal and truncation, then to an accented result recorded with its model and prompt version. A dashed exit from the primary model on a timeout, 429 or 5xx goes to a dashed fallback model on another provider or size, whose output goes through the same checks. A dashed exit from validation when output is still invalid goes to a terminal degraded mode in which the feature works without AI.](/diagrams/llm-features-fallback.svg "Two exits, both planned: a provider failure tries a qualified fallback model through the same validation, and output that still fails validation drops the feature to a mode that works without the model.")

- **Fallback model on provider errors.** Timeouts, 429s and 5xx responses go to a qualified fallback (another provider, or another size from the same one), with its own prompt variant and eval results. A circuit breaker per provider stops sending traffic into an outage ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#circuit-breakers)).
- **Degraded mode for everything else.** The feature works without the model, visibly: the ticket goes to a triage queue instead of being auto-routed, the extraction form is blank instead of pre-filled, the help widget shows search results instead of an answer. Nothing core to the product waits on a model.
- **Cache what's stable.** A summary of a closed ticket, an extraction from a document that won't change, the embedding of an unchanged chunk: compute once, store with versions, serve from storage.
- **Say so.** "Suggested replies are unavailable right now" is better than a spinner, and much better than an empty draft the agent sends by mistake.

## What Goes to the Provider

Every prompt is data sent to a processor. Know what each provider does with it, put it in the contract, and send only what the feature needs.

- **Read the retention terms for the exact service you use.** OpenAI says API data is not used to train its models by default, abuse monitoring logs are "retained for up to 30 days," and zero data retention is "subject to prior approval." Anthropic deletes API inputs and outputs "within 30 days of receipt or generation" by default, keeps flagged content longer, and offers zero retention by agreement. Google's Gemini API terms differ by tier: on unpaid services, Google uses submitted content "to provide, improve, and develop" its products and "human reviewers may read, annotate, and process your API input and output," while on paid services it says it doesn't use prompts or responses to improve its products. A free tier used in development with real customer data is a data incident.
- **Features within a provider differ too.** Anthropic's batch processing, for example, is listed as not eligible for zero data retention. Check retention per endpoint, not per vendor.
- **Minimize.** Send the ticket text, not the customer record it's attached to; redact card numbers, government IDs and secrets before the prompt is built ([Sensitive Data](/docs/security/sensitive-data#classify-every-field)). Classified fields that must never leave are blocked in the adapter, not by convention.
- **The provider is a processor.** It goes in your subprocessor list and DPA, with the regions it processes in ([GDPR & Privacy](/docs/compliance/gdpr#controllers-processors-and-the-dpa)). Prompts and outputs you store yourself (for evals, for audit) get a retention window and join the [erasure pipeline](/docs/building-blocks/data-retention#erasure-requests).
- **Tell users.** Where a feature sends their content to a model provider, say so in the product and the privacy notice, and give tenants a switch to turn the feature off.

## Human Review Where Errors Are Costly

For the expensive-mistake rows of the table at the top, the model drafts and a person decides. That only works if the review is real.

- **Show the evidence next to the draft.** Every extracted field highlighted in the source document, every claim in an answer linked to its citation. A reviewer who has to hunt for the source rubber-stamps instead.
- **Make editing easier than accepting blindly.** Fields editable in place, and the draft clearly marked as a draft until confirmed.
- **Record the decision.** Accepted, edited (with the diff) or rejected, by whom, against which model and prompt version. Edits are your best eval data; a reviewer who accepts everything in two seconds is a signal the review has stopped working.
- **Don't trust self-reported confidence alone.** A model asked how sure it is gives a number, not a measurement. Calibrate thresholds against your eval set (what fraction of outputs above 0.9 were actually right?) before using them to skip review.

## Checklist

- **Choose the design by the cost of being wrong:** automatic when cheap, a reviewed draft when expensive.
- **Structured outputs against a schema,** then strict parsing and value validation; refusals and truncation are invalid outputs.
- **Skip retrieval for small corpora;** otherwise chunk with context, search hybrid, filter permissions in the query, verify citations.
- **Route models per task in config,** pin versions, keep a second provider qualified.
- **Evals per feature in CI:** code-graded first, calibrated LLM judges second, every reported failure added.
- **Version prompts as code** and record model, prompt and index versions on every result.
- **Stream what people read, background what code reads,** with a deadline on every call.
- **Account tokens per feature and tenant,** cache stable prefixes, batch what isn't interactive, budget per tenant.
- **A fallback model and a degraded mode** for every feature, designed before launch.
- **Know each endpoint's retention terms,** minimize what's sent, and list the provider as a processor.
- **Real human review** with evidence beside every draft, and the decision recorded.

## References

**Reference**

- [Anthropic: Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), constrained decoding, refusals, `max_tokens` truncation and unsupported schema features
- [OpenAI: Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), schema adherence versus JSON mode and the `refusal` field
- [Google: Structured output](https://aistudio.google.com/docs/structured-output), JSON Schema output for Gemini and validating values in the application
- [Anthropic: Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), cache write and read pricing, lifetimes, minimum lengths and identical prefixes
- [OpenAI: Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), automatic caching, minimum length, stable content first and retention
- [Anthropic: Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing), the 50 percent discount, completion times and zero-retention eligibility
- [OpenAI: Data controls in the OpenAI platform](https://developers.openai.com/api/docs/guides/your-data), training defaults, abuse monitoring retention and zero data retention
- [Anthropic: How long do you store my organization's data?](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data), default API retention and exceptions
- [Google: Gemini API additional terms of service](https://aistudio.google.com/docs/terms), how unpaid and paid services use prompts and responses
- [Elastic: Reciprocal rank fusion](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion), combining result sets by rank with `k` defaulting to 60

**In practice**

- [Anthropic: Introducing Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval), whole-corpus prompting under 200,000 tokens, contextual chunks, hybrid retrieval, reranking and top-20 retrieval
- [Liu et al.: Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172), position effects in long contexts
- [Zheng et al.: Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685), agreement with human preferences and judge biases
