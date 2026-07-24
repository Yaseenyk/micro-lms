/**
 * Course content source of truth (docs/03 §4). Authored here, seeded into the
 * `courseContent` collection by scripts/seed-content.ts. Also drives the
 * server-side catalog (config/catalog.ts) for price + lesson counts.
 *
 * Content is textual + SVG only — no video. Keep it real and specific.
 */
import type { ContentBlock } from "../domain/types.js";
import { svg, type SVGS } from "./svgs.js";

type B = ContentBlock;
const h = (text: string): B => ({ type: "heading", text });
const p = (text: string): B => ({ type: "paragraph", text });
const ul = (items: string[]): B => ({ type: "list", items });
const code = (language: string, src: string, caption?: string): B => ({
  type: "code",
  language,
  code: src,
  ...(caption ? { caption } : {}),
});
const info = (text: string): B => ({ type: "callout", tone: "info", text });
const warn = (text: string): B => ({ type: "callout", tone: "warn", text });
const win = (text: string): B => ({ type: "callout", tone: "success", text });
const fig = (name: keyof typeof SVGS, caption: string): B => ({ type: "svg", svg: svg(name), caption });
// Course scaffolding — what turns a summary into a lesson (docs/03 §4).
const obj = (items: string[]): B => ({ type: "objectives", items });
const steps = (items: string[]): B => ({ type: "steps", items });
const sum = (items: string[]): B => ({ type: "summary", items });
const ex = (title: string, text: string, hint?: string): B => ({
  type: "exercise",
  title,
  text,
  ...(hint ? { hint } : {}),
});

export interface SeedLesson {
  id: string;
  title: string;
  minutes: number;
  blocks: B[];
}
export interface SeedCourse {
  id: string;
  title: string;
  tagline: string;
  blurb: string;
  priceInPaise: number;
  hours: string;
  outcomes: string[];
  lessons: SeedLesson[];
}

export const COURSES: SeedCourse[] = [
  {
    id: "rag-systems",
    title: "Retrieval-Augmented Generation",
    tagline: "Give language models a memory they can cite.",
    blurb:
      "Build RAG systems that ground answers in your own data — chunking, embeddings, vector search, and the prompt assembly that stops models from making things up.",
    priceInPaise: 79_900,
    hours: "5h 10m",
    outcomes: [
      "Chunk and embed a corpus without destroying meaning",
      "Retrieve the right context with hybrid search",
      "Assemble prompts that ground and cite sources",
      "Measure and fix retrieval quality",
    ],
    lessons: [
      {
        id: "les_1",
        title: "Why RAG beats a bigger prompt",
        minutes: 22,
        blocks: [
          obj([
            "Explain what a model can and cannot know at inference time",
            "Compare the three ways to give a model knowledge, and when each wins",
            "Trace the four steps every RAG system performs",
            "Recognise the cases where RAG is the wrong tool",
          ]),
          p("A language model knows two things: what it absorbed during training, and what you put in the prompt. That is the whole universe. It has no connection to your database, your wiki, or last Tuesday's incident report unless you hand that text over at query time."),
          p("So when someone asks your assistant *what is our refund window for enterprise plans*, the model has three possible fates. It can know the answer from training data (unlikely, and impossible for private data). It can be handed the answer in the prompt. Or it can invent something plausible. The third outcome is what people call hallucination, and it is not a bug in the model. It is the predictable result of asking a question the prompt did not contain the answer to."),
          h("Three ways to give a model knowledge"),
          p("Before reaching for retrieval, it is worth knowing the alternatives, because each solves a genuinely different problem."),
          ul([
            "**Fine-tuning** bakes behaviour into the weights. Excellent for teaching *form* — tone, output format, a specialised skill. Poor for teaching *facts*: it is slow, expensive, and every content change means retraining.",
            "**Long context** pastes everything into the prompt. Simple, and increasingly viable as windows grow. But you pay for every token on every call, and quality degrades as the window fills.",
            "**Retrieval (RAG)** fetches only the few passages that matter, per question. Cheap, updatable the moment your data changes, and auditable because you know exactly what the model was shown.",
          ]),
          win("Facts change, so retrieve them. Behaviour is stable, so train it. Teams that fine-tune for knowledge end up retraining forever."),
          h("The core loop"),
          p("Every RAG system, from a weekend prototype to a platform serving millions, performs the same four steps. The sophistication lives inside each step, never in the shape."),
          steps([
            "**Embed the question** into a vector that represents its meaning.",
            "**Search** a vector store for the chunks whose vectors sit closest to it.",
            "**Assemble** a prompt containing those chunks plus the original question.",
            "**Generate** the answer, constrained to the supplied context.",
          ]),
          fig("retrieval", "The retrieval loop: query, vector store, top-k, model"),
          p("Here is that entire loop with nothing hidden. Roughly fifteen lines is genuinely all it takes to get a working baseline, and you should build this before adding a framework."),
          code(
            "ts",
            `async function answer(question: string) {
  // 1. embed the question
  const qVec = await embed(question);

  // 2. nearest neighbours from the store
  const chunks = await store.search(qVec, { topK: 5 });

  // 3. assemble a grounded prompt
  const context = chunks
    .map((c, i) => "[" + (i + 1) + "] " + c.text)
    .join("\\n\\n");

  // 4. generate, constrained to that context
  return llm.complete(
    "Answer using ONLY the context below. Cite sources as [n].\\n\\n" +
    "Context:\\n" + context + "\\n\\nQuestion: " + question
  );
}`,
            "A complete RAG pipeline. Every production system is this, with each step hardened.",
          ),
          h("Why not just paste everything?"),
          p("Context windows keep growing, so the obvious question is why bother retrieving at all. Four reasons, and only the first is about size."),
          ul([
            "**Cost and latency scale with every token, on every call.** Sending a 200-page handbook to answer *what is the refund window* means paying for 200 pages to use three sentences, on every single request.",
            "**Attention degrades with length.** Models reliably attend to the start and end of a long context and get measurably worse at material buried in the middle. More context can mean *worse* answers.",
            "**Corpora outgrow any window.** A company wiki is hundreds of megabytes. No window is large enough, and it changes daily.",
            "**Auditability.** With retrieval you know precisely which passages produced an answer. That is the difference between a demo and something legal will sign off on.",
          ]),
          warn("RAG is not a fix for bad source material. If your documentation is contradictory or stale, retrieval will faithfully find the contradictions and the model will confidently repeat them. Garbage in, cited garbage out."),
          h("When RAG is the wrong tool"),
          p("Reaching for retrieval reflexively is its own failure mode. Skip it when the question does not need a lookup."),
          ul([
            "The task is transformation, not recall — summarise this text, translate this, rewrite this email. The content is already in the prompt.",
            "The answer needs computation or a live system call. That is a tool call or a database query, not a similarity search.",
            "The corpus is genuinely tiny and stable. Ten paragraphs that never change belong in the system prompt.",
          ]),
          ex(
            "Your turn",
            "Take a question your own product or team gets asked constantly. Write down: (a) where the answer actually lives today, (b) how many sentences are genuinely needed to answer it, and (c) how often that source changes. Then decide, with a reason, whether it calls for retrieval, long context, or fine-tuning.",
            "If the answer changes more often than you would want to retrain, and it lives somewhere searchable, you are describing a retrieval problem.",
          ),
          sum([
            "A model knows only its training data plus the prompt; everything else must be supplied at query time.",
            "Retrieve facts, fine-tune behaviour, and use long context when the material is small and already at hand.",
            "Every RAG system is embed, search, assemble, generate — the craft is inside those steps.",
            "Retrieval beats a bigger prompt on cost, on attention quality, on scale, and on auditability.",
            "Retrieval cannot rescue a corpus that is wrong; fix the source before blaming the pipeline.",
          ]),
        ],
      },
      {
        id: "les_2",
        title: "Chunking without destroying meaning",
        minutes: 26,
        blocks: [
          obj([
            "Explain why chunk size sets the ceiling on retrieval quality",
            "Choose between fixed, recursive, and structural splitting",
            "Apply overlap and metadata correctly",
            "Diagnose the two failure modes: noise and severed context",
          ]),
          p("Your system never retrieves documents. It retrieves *chunks*. Every embedding, every similarity score, every passage the model finally reads is a chunk you created. Which means chunking is not preprocessing — it is the single decision that caps how good your retrieval can ever be."),
          p("Get it wrong and no amount of reranking, prompt engineering, or model upgrading recovers the loss. The right sentence simply is not retrievable, because it no longer exists as a coherent unit."),
          h("The two failure modes"),
          p("Chunking pulls in two opposite directions, and both extremes fail in ways that are easy to misdiagnose as model problems."),
          ul([
            "**Chunks too large.** The embedding becomes an average of many topics, so it sits in the middle of everything and is strongly similar to nothing. You retrieve a ten-page section to answer a one-line question, and the model has to find the needle you failed to find.",
            "**Chunks too small.** You sever the context a sentence needs. *It expires after 30 days* is useless when the sentence naming what *it* is landed in the previous chunk.",
          ]),
          info("A useful mental test: could a colleague answer the question if you handed them this chunk and nothing else? If not, the chunk is wrong, regardless of its character count."),
          h("Three strategies, in order of preference"),
          p("These are not equally good. Reach for the last one first and fall back only when the format forces you to."),
          ul([
            "**Structural splitting.** Split on the document's own boundaries — headings, sections, list items, function definitions. The author already grouped related ideas; inherit their work.",
            "**Recursive splitting.** Try to split on paragraphs; if a piece is still too big, split on sentences; then on words. Preserves as much natural structure as fits the budget.",
            "**Fixed-size splitting.** Cut every N characters. Fast, format-agnostic, and blind. It will cut mid-sentence and mid-table. Use it only as a last resort.",
          ]),
          fig("funnel", "A corpus narrowed to the few chunks that answer one question"),
          h("A practical recipe"),
          steps([
            "Split on the largest structural boundary the format offers (heading, section, article).",
            "If a piece exceeds your budget, split it recursively on paragraphs, then sentences.",
            "Add roughly 10 to 15 percent overlap so a fact straddling a boundary survives in one of the two chunks.",
            "Attach metadata to every chunk: source id, title, section path, and last-updated date.",
            "Never let a chunk span two source documents.",
          ]),
          p("The naive implementation everyone starts with looks like this — and it is worth seeing precisely why it is inadequate."),
          code(
            "ts",
            `// Naive: fast, format-blind, cuts mid-sentence.
function chunkFixed(doc: string, size = 800, overlap = 120) {
  const out: string[] = [];
  for (let i = 0; i < doc.length; i += size - overlap) {
    out.push(doc.slice(i, i + size));
  }
  return out;
}`,
            "Works, but it will happily cut a sentence, a code block, or a table in half.",
          ),
          p("The version worth shipping respects structure first and only falls back to slicing when a section genuinely exceeds the budget. Note that it carries metadata through — that is not a detail, it is half the value."),
          code(
            "ts",
            `interface Chunk {
  text: string;
  sourceId: string;
  section: string;
  updatedAt: string;
}

function chunkDoc(doc: Doc, max = 800, overlap = 120): Chunk[] {
  const out: Chunk[] = [];

  // 1. structural: the author's own sections
  for (const section of doc.sections) {
    const base = {
      sourceId: doc.id,
      section: section.heading,
      updatedAt: doc.updatedAt,
    };

    if (section.text.length <= max) {
      out.push({ text: section.text, ...base });
      continue;
    }

    // 2. recursive: paragraphs, packed up to the budget
    let buf = "";
    for (const para of section.text.split(/\\n\\s*\\n/)) {
      if ((buf + para).length > max && buf) {
        out.push({ text: buf.trim(), ...base });
        buf = buf.slice(-overlap); // 3. carry overlap forward
      }
      buf += para + "\\n\\n";
    }
    if (buf.trim()) out.push({ text: buf.trim(), ...base });
  }

  return out;
}`,
            "Structure first, recursion as fallback, overlap carried forward, metadata attached throughout.",
          ),
          h("Metadata is half the value"),
          p("Teams obsess over chunk size and forget metadata, then discover they cannot filter results by tenant, language, or recency — and cannot cite a source, because the chunk no longer knows where it came from."),
          p("Every chunk should be able to answer three questions about itself: where did I come from, which part of that document am I, and how fresh am I? Those fields power citations, permission filtering, and the ability to prefer recent material over stale material."),
          warn("Never let a chunk span two documents. It corrupts citations (which source do you attribute?) and creates embeddings representing a blend of unrelated ideas that will surface for the wrong queries."),
          ex(
            "Your turn",
            "Take one real document — a README, a policy page, a wiki article. Chunk it by hand at roughly 800 characters using structural boundaries. Now write down three questions a user would genuinely ask of it, and check whether any single chunk fully answers each one. Every question that no chunk can answer alone is a chunking bug you just found before your users did.",
            "Questions that span sections are the interesting ones. They usually mean your boundary is one level too fine, or that the answer needs two chunks retrieved together.",
          ),
          sum([
            "Retrieval operates on chunks, so chunking sets the ceiling on everything downstream.",
            "Too large blurs the embedding into meaning nothing; too small severs the context a sentence depends on.",
            "Prefer structural boundaries, fall back to recursive splitting, and treat fixed-size as a last resort.",
            "Overlap by 10 to 15 percent so facts on a boundary survive.",
            "Carry source, section, and freshness metadata on every chunk — it powers citations and filtering.",
            "A chunk must belong to exactly one document.",
          ]),
        ],
      },
      {
        id: "les_3",
        title: "Embeddings and vector search",
        minutes: 31,
        blocks: [
          obj([
            "Describe what an embedding actually represents",
            "Pick the right similarity metric and embedding model",
            "Explain why dense search alone misses exact terms",
            "Combine dense and keyword search with rank fusion",
          ]),
          p("An embedding converts text into a list of numbers — a vector — positioned so that texts with similar meaning land near each other. *Cancel my subscription* and *how do I end my plan* share almost no words, yet their vectors are neighbours. That is the entire trick, and it is what lets retrieval work on meaning rather than string matching."),
          p("Once text is vectors, search becomes geometry. Finding relevant passages means finding the points nearest to the question's point."),
          fig("vectors", "Related meanings cluster; retrieval returns the query's nearest neighbours"),
          h("Measuring closeness"),
          p("Nearly all text embeddings are compared with **cosine similarity**, which measures the angle between two vectors while ignoring their length. Direction carries the meaning; magnitude mostly reflects text length, which you do not want to rank on."),
          code(
            "ts",
            `function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
// 1.0 = identical direction, 0 = unrelated, -1 = opposite.`,
            "If your vectors are already normalised, a plain dot product gives the same ranking for less work.",
          ),
          info("Use whichever metric your embedding model was trained with. Most modern text models expect cosine. Mismatching the metric quietly degrades every result without ever throwing an error."),
          h("Choosing an embedding model"),
          p("Model choice is a real trade-off, not a detail to default past. Four things matter."),
          ul([
            "**Dimensions.** More dimensions can capture more nuance but cost more memory and slower search. 768 to 1536 is the common sweet spot.",
            "**Max input length.** If the model truncates at 512 tokens, chunks longer than that are silently cut — and you will never be told.",
            "**Domain fit.** A general model may not separate specialised jargon well. Test on *your* content, not a benchmark.",
            "**Cost and latency.** You embed the whole corpus once, but every single query embeds too, on the hot path.",
          ]),
          warn("Never mix embeddings from two different models in one index. Their vector spaces are unrelated, so the distances between them are meaningless — and it fails silently, returning confident nonsense. Changing models means re-embedding everything."),
          h("Where dense search fails"),
          p("Embeddings understand meaning, which is exactly why they are bad at *literals*. A user searching for error code `ERR_2043`, a SKU, or a specific function name wants an exact match. Semantically, `ERR_2043` and `ERR_2044` are nearly identical — the embedding cannot tell them apart, but your user very much can."),
          p("Keyword search (BM25) has the mirror-image profile: perfect on exact tokens, useless on paraphrase. It will never connect *cancel my subscription* to *end my plan*."),
          ul([
            "**Dense (embeddings)** — strong on meaning and paraphrase, weak on exact identifiers.",
            "**Sparse (BM25 keyword)** — strong on exact terms and rare words, blind to synonyms.",
            "**Hybrid** — run both, fuse the rankings. Reliably better than either alone.",
          ]),
          h("Fusing two rankings"),
          p("The standard way to merge is Reciprocal Rank Fusion. It uses only each result's *position* in each list, so you never have to reconcile a cosine score with a BM25 score — two numbers on incomparable scales."),
          code(
            "ts",
            `function reciprocalRankFusion(lists: string[][], k = 60) {
  const scores = new Map<string, number>();

  for (const list of lists) {
    list.forEach((id, rank) => {
      // rank is 0-based; earlier positions contribute more
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + rank + 1));
    });
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

const fused = reciprocalRankFusion([denseResults, keywordResults]);`,
            "Documents ranked highly by both retrievers rise to the top; k dampens the influence of any single list.",
          ),
          h("Approximate search and recall"),
          p("Exact nearest-neighbour search over millions of vectors is too slow, so vector databases use approximate indexes such as HNSW. They trade a small amount of accuracy for enormous speed, and that trade is tunable at query time."),
          p("The number that matters is **recall**: of the truly nearest results, how many did the index actually return? Measure it once against a brute-force baseline on a sample. If recall is 80 percent, one in five relevant passages is invisible to your model, and no prompt engineering will bring it back."),
          win("Default your index toward recall over raw speed. Saving 20ms is worthless if the answer was in the chunk you skipped."),
          ex(
            "Your turn",
            "Write ten questions real users would ask of your corpus. Deliberately include two containing an exact identifier — an error code, a product name, a config key. Run all ten through dense-only search and note which fail. Those failures are precisely the ones hybrid search exists to fix.",
            "The literal-identifier questions are the ones that break. If they retrieve near-miss neighbours (ERR_2044 instead of ERR_2043), you have just reproduced the classic dense-search failure.",
          ),
          sum([
            "An embedding places text in a space where distance approximates difference in meaning.",
            "Cosine similarity is the usual metric; always match what the model was trained with.",
            "Choose a model on dimensions, max input length, domain fit, and query-time cost.",
            "Never mix models in one index — the spaces are unrelated and it fails silently.",
            "Dense search misses exact identifiers; keyword search misses paraphrase; hybrid plus rank fusion beats both.",
            "Measure recall against a brute-force baseline, and tune the index toward recall.",
          ]),
        ],
      },
      {
        id: "les_4",
        title: "Grounding, citations, and evals",
        minutes: 28,
        blocks: [
          obj([
            "Write a prompt that constrains the model to its retrieved context",
            "Produce citations users can actually verify",
            "Measure retrieval hit-rate and faithfulness separately",
            "Diagnose which stage of the pipeline a failure came from",
          ]),
          p("Perfect retrieval still produces wrong answers if the prompt lets the model wander. Handed five relevant chunks, a model will cheerfully blend them with its training data, fill gaps with plausible invention, and present the mixture in one confident voice. Grounding is the contract that stops it."),
          h("The grounding contract"),
          p("A grounding prompt makes three demands: answer only from the supplied context, admit when the context is insufficient, and cite which passage each claim came from. The third is what makes the first two verifiable."),
          code(
            "ts",
            `function buildPrompt(chunks: Chunk[], question: string) {
  const context = chunks
    .map((c, i) => "[" + (i + 1) + "] (" + c.section + ")\\n" + c.text)
    .join("\\n\\n");

  return [
    "Answer the question using ONLY the context below.",
    "If the context does not contain the answer, reply exactly:",
    '"I could not find this in the available documents."',
    "Cite the passage number for every claim, like [2].",
    "Do not use prior knowledge. Do not guess.",
    "",
    "Context:",
    context,
    "",
    "Question: " + question,
  ].join("\\n");
}`,
            "The explicit refusal string matters: without a sanctioned way to say 'I do not know', a model will invent.",
          ),
          info("Give the model a specific, permitted failure response. Models invent partly because nothing in the prompt authorises them to decline."),
          h("Citations users can verify"),
          p("A citation is only worth something if a reader can follow it back. `[2]` alone is decoration. Map each number to the source title, section, and a link, then render them under the answer. This is also your fastest debugging tool: when an answer is wrong you can see instantly whether retrieval fetched the wrong passage or the model misread the right one."),
          warn("Never let the model invent citation numbers. Validate that every [n] it emitted actually exists in what you supplied, and strip or flag any that do not. Fabricated citations are worse than none — they look trustworthy."),
          h("The two numbers that matter"),
          p("Most teams track one vague sense of 'quality' and cannot act on it. Split it in two, because each points at a different stage and a different fix."),
          ul([
            "**Retrieval hit-rate.** Of the questions where the answer genuinely exists in the corpus, how often did the correct chunk appear in the top-k? This grades chunking, embeddings, and search.",
            "**Faithfulness.** Of the answers produced, how many stayed strictly inside the retrieved context? This grades the prompt and the model.",
          ]),
          p("The diagnosis follows mechanically. Hit-rate is low: fix chunking, the embedding model, or add hybrid search. Hit-rate is fine but faithfulness is low: tighten the grounding prompt. Both fine but users are still unhappy: your corpus does not contain the answers, and no pipeline change will help."),
          fig("evalloop", "Prompt, output, score, refine — the loop that replaces guesswork"),
          h("Building the eval set"),
          p("An eval set is a fixed list of questions with known-good expectations. Thirty real questions, drawn from actual user requests, is enough to catch most regressions. Build it *before* you start tuning, or every change is a guess and you will optimise for whatever you happened to test by hand."),
          steps([
            "Collect 30 real questions users have actually asked.",
            "For each, record which chunk or document truly contains the answer.",
            "Run retrieval and score hit-rate: was that chunk in the top-k?",
            "Run generation and score faithfulness: is every claim supported by a cited passage?",
            "Re-run the whole set on every prompt, model, or chunking change.",
          ]),
          code(
            "ts",
            `interface EvalCase {
  question: string;
  expectedChunkId: string;
}

async function scoreRetrieval(cases: EvalCase[], k = 5) {
  let hits = 0;
  for (const c of cases) {
    const results = await search(c.question, { topK: k });
    if (results.some((r) => r.id === c.expectedChunkId)) hits++;
  }
  return hits / cases.length; // hit-rate @k
}`,
            "Retrieval scoring needs no model calls, so it is cheap enough to run on every commit.",
          ),
          p("Faithfulness is harder to score automatically because it is a judgement about open text. A second model can grade it against a tight rubric — *is every claim in this answer supported by the cited passage, yes or no* — which is far cheaper than human review. Spot-check the judge against your own labels occasionally to keep it honest."),
          win("Score retrieval on every commit, and faithfulness before every release. The first is nearly free; the second is what protects your users."),
          ex(
            "Your turn",
            "Build a ten-case eval set for a corpus you have. For each question, note the document that truly answers it. Run your retrieval and compute hit-rate at k=5. Then change one variable — chunk size, or top-k — and re-run. You now have the smallest possible version of the loop every serious RAG team runs.",
            "If hit-rate is already 100 percent on ten cases, your questions are too easy. Add the ambiguous, multi-part ones real users actually ask.",
          ),
          sum([
            "Retrieval alone does not prevent invention; the prompt must forbid it and authorise a refusal.",
            "Citations must be verifiable and validated — never let the model invent a passage number.",
            "Track retrieval hit-rate and faithfulness separately; each blames a different stage.",
            "Low hit-rate means fix search; low faithfulness means fix the prompt; both healthy means fix the corpus.",
            "Build a 30-question eval set before tuning, or every improvement is a guess.",
          ]),
        ],
      },
    ],
  },

  {
    id: "agentic-ai",
    title: "Agentic AI Systems",
    tagline: "Models that plan, use tools, and act.",
    blurb:
      "Move beyond single prompts to agents that reason, call tools, and recover from failure — with the guardrails that keep them safe and affordable.",
    priceInPaise: 99_900,
    hours: "6h 05m",
    outcomes: [
      "Design the reason → act → observe loop",
      "Expose tools an agent can call reliably",
      "Add memory, guardrails, and cost limits",
      "Debug and evaluate multi-step runs",
    ],
    lessons: [
      {
        id: "les_1",
        title: "The agent loop",
        minutes: 24,
        blocks: [
          p("An agent is a model in a loop: it reasons about the goal, chooses an action (usually a tool call), observes the result, and repeats until done. That single idea — reason, act, observe — is the whole paradigm."),
          fig("loop", "The reason → act → observe loop, with tools on the side"),
          h("Why a loop and not one prompt"),
          p("Hard tasks need intermediate results the model can't know up front: a search result, a calculation, the current time. The loop lets the model gather those, one step at a time, and adjust."),
          warn("A loop without a step limit is a bill without a ceiling. Always cap iterations and total tokens."),
        ],
      },
      {
        id: "les_2",
        title: "Tools the model can actually use",
        minutes: 30,
        blocks: [
          p("A tool is a typed function the model may call. The model never runs code — it emits a structured call, your runtime executes it, and you feed the result back. The quality of your tool schemas decides how often the agent succeeds."),
          code("ts", "const searchTool = {\n  name: 'search_docs',\n  description: 'Find passages in the product manual.',\n  parameters: { query: { type: 'string' } },\n  run: async ({ query }) => db.search(query),\n};"),
          ul([
            "Name and describe tools for the model, not for you — it only sees the text.",
            "Validate arguments before executing; models hallucinate parameters.",
            "Return compact, structured results — not a wall of HTML.",
          ]),
          info("Fewer, sharper tools beat a big menu. Every extra tool is another thing the model can pick wrongly."),
        ],
      },
      {
        id: "les_3",
        title: "Memory and state",
        minutes: 27,
        blocks: [
          p("The model is stateless; your agent is not. You decide what to carry between steps: the running transcript, a scratchpad of facts, and long-term memory retrieved when relevant (that's RAG, inside an agent)."),
          h("Three memories"),
          ul([
            "Working memory: the current loop's messages (fits in context).",
            "Episodic memory: past runs, summarised and stored.",
            "Semantic memory: durable facts in a vector store, retrieved on demand.",
          ]),
          win("Summarise the transcript when it grows past a threshold instead of truncating — you keep the thread without blowing the context window."),
        ],
      },
      {
        id: "les_4",
        title: "Guardrails, cost, and evaluation",
        minutes: 29,
        blocks: [
          p("Autonomy is risk. Guardrails are the constraints that make an agent shippable: allow-listed tools, output validation, human approval for irreversible actions, and hard budgets."),
          code("ts", "if (step > MAX_STEPS || tokens > MAX_TOKENS)\n  return finish('Stopped: budget reached');"),
          h("Evaluating a loop"),
          p("You can't grade an agent on one output — grade the trajectory: did it reach the goal, in how many steps, at what cost, without touching anything it shouldn't? Log every step so a failed run is debuggable."),
          warn("Give human approval to any action that spends money, sends messages, or deletes data. The model will eventually try all three."),
        ],
      },
    ],
  },

  {
    id: "ml-foundations",
    title: "Machine Learning Foundations",
    tagline: "The core ideas everything else is built on.",
    blurb:
      "The mental models behind every ML system — features, training, generalisation, and evaluation — taught with intuition first and just enough math.",
    priceInPaise: 69_900,
    hours: "5h 40m",
    outcomes: [
      "Frame a problem as supervised learning",
      "Understand training, loss, and gradient descent",
      "Diagnose overfitting vs underfitting",
      "Evaluate models honestly",
    ],
    lessons: [
      {
        id: "les_1",
        title: "What learning from data means",
        minutes: 23,
        blocks: [
          p("Machine learning is fitting a function from examples. You show the model inputs and correct outputs, and it adjusts its parameters until its predictions match — hoping the pattern generalises to inputs it never saw."),
          fig("pipeline", "Data → model → prediction: the supervised learning shape"),
          h("The only three ingredients"),
          ul([
            "A dataset of (input, target) pairs.",
            "A model with tunable parameters.",
            "A loss that measures how wrong a prediction is.",
          ]),
          info("If you can't write down the target and the loss, you don't yet have a machine-learning problem — you have a data problem to solve first."),
        ],
      },
      {
        id: "les_2",
        title: "Training and gradient descent",
        minutes: 30,
        blocks: [
          p("Training minimises the loss by nudging parameters in the direction that reduces error — the gradient. Repeat over many small steps and the model rolls downhill to a good fit."),
          code("py", "for epoch in range(epochs):\n    pred = model(X)\n    loss = mse(pred, y)\n    grad = loss.backward()\n    params -= lr * grad   # step downhill"),
          h("Learning rate is the dial that matters"),
          p("Too large and training diverges; too small and it crawls. Most 'the model won't learn' problems are a learning-rate problem in disguise."),
          warn("Always hold out data the model never trains on. Loss on training data always looks good — it's the honest test that counts."),
        ],
      },
      {
        id: "les_3",
        title: "Overfitting and generalisation",
        minutes: 28,
        blocks: [
          p("A model that memorises its training set but fails on new data has overfit. One that's too simple to capture the pattern has underfit. The whole craft is finding the middle."),
          ul([
            "Underfit: high error on both train and test — add capacity or features.",
            "Overfit: low train error, high test error — add data or regularisation.",
            "Good fit: train and test error are close and low.",
          ]),
          fig("network", "More capacity fits more — until it fits the noise"),
          info("More data beats a cleverer model more often than you'd expect. Try that first."),
        ],
      },
      {
        id: "les_4",
        title: "Evaluating models honestly",
        minutes: 26,
        blocks: [
          p("Accuracy hides more than it reveals. On imbalanced data a model that always says 'no' can score 95% and be useless. Pick metrics that match the cost of each mistake."),
          h("Precision vs recall"),
          p("Precision asks: of the things I flagged, how many were right? Recall asks: of the things I should have flagged, how many did I catch? You usually trade one for the other."),
          win("Choose the metric before you train. Choosing it after is how teams fool themselves into shipping bad models."),
        ],
      },
    ],
  },

  {
    id: "llm-engineering",
    title: "LLM Application Engineering",
    tagline: "Ship reliable products on top of language models.",
    blurb:
      "The engineering around the model: structured outputs, streaming, context windows, caching, and the failure handling that turns a demo into a product.",
    priceInPaise: 89_900,
    hours: "5h 25m",
    outcomes: [
      "Get structured, validated output every time",
      "Manage context windows and token budgets",
      "Stream responses and handle failures",
      "Cache and cut latency + cost",
    ],
    lessons: [
      {
        id: "les_1",
        title: "Structured output you can trust",
        minutes: 25,
        blocks: [
          p("A product needs data, not prose. The difference between a toy and a tool is that the tool gets back a validated object every single call — never a paragraph it has to parse with a regex."),
          code("ts", "const schema = z.object({ intent: z.enum(['buy','support']), urgency: z.number() });\nconst data = schema.parse(await model.json(prompt));"),
          info("Validate on your side even when the API guarantees JSON mode. 'Valid JSON' and 'the shape you needed' are different promises."),
          fig("pipeline", "Prompt → model → validated object"),
        ],
      },
      {
        id: "les_2",
        title: "Context windows and token budgets",
        minutes: 27,
        blocks: [
          p("Everything the model sees — system prompt, history, retrieved context, the question — competes for a fixed window. Managing that budget is a core engineering job, not an afterthought."),
          ul([
            "Reserve room for the answer; don't fill the window to the brim.",
            "Summarise or drop old turns before you hit the limit.",
            "Put the most important instructions where the model attends best — start and end.",
          ]),
          warn("Token cost scales with everything you send, every call. A chat that never trims its history gets slower and pricier with each message."),
        ],
      },
      {
        id: "les_3",
        title: "Streaming and graceful failure",
        minutes: 24,
        blocks: [
          p("Latency is a UX problem. Streaming tokens as they arrive makes a 10-second answer feel instant. And because the network and the model both fail, retries and fallbacks aren't optional."),
          code("ts", "for await (const token of model.stream(prompt)) {\n  res.write(token);\n}"),
          h("Fail like a professional"),
          p("Timeout long calls, retry transient errors with backoff, and keep a cheaper fallback model for when the primary is down. Never show the user a raw stack trace."),
          win("A fast, occasionally-simpler answer beats a perfect answer that spins for fifteen seconds."),
        ],
      },
      {
        id: "les_4",
        title: "Caching and cost control",
        minutes: 26,
        blocks: [
          p("The cheapest model call is the one you don't make. Cache identical requests, reuse embeddings, and prompt-cache stable prefixes so you pay for the model's intelligence, not its repetition."),
          ul([
            "Cache on a hash of the full prompt for deterministic tasks.",
            "Precompute and store embeddings — never re-embed the same text.",
            "Batch where the API allows it.",
          ]),
          info("Instrument tokens-per-request from day one. You can't cut a cost you don't measure."),
        ],
      },
    ],
  },

  {
    id: "prompt-engineering",
    title: "Prompt Engineering & Evaluation",
    tagline: "Make prompts a controlled variable, not a guess.",
    blurb:
      "Treat prompts like code: patterns that work, why they work, and the evaluation loop that turns 'it felt better' into a number you can defend.",
    priceInPaise: 49_900,
    hours: "4h 15m",
    outcomes: [
      "Apply reliable prompting patterns",
      "Use few-shot examples effectively",
      "Build an eval set and score changes",
      "Stop tuning by vibes",
    ],
    lessons: [
      {
        id: "les_1",
        title: "Anatomy of a good prompt",
        minutes: 22,
        blocks: [
          p("A good prompt sets a role, states the task plainly, shows the output format, and hands over only the context that's needed. Vague prompts get vague answers; specific prompts get specific ones."),
          ul([
            "Role: who the model is acting as.",
            "Task: one clear instruction, not five buried in a paragraph.",
            "Format: show the exact shape you want back.",
            "Context: the minimum facts required, clearly delimited.",
          ]),
          info("If a human contractor couldn't do the task from your prompt alone, the model can't either."),
        ],
      },
      {
        id: "les_2",
        title: "Few-shot and reasoning patterns",
        minutes: 24,
        blocks: [
          p("Examples teach format and edge cases faster than instructions. And for multi-step problems, asking the model to work through its reasoning before answering measurably improves accuracy."),
          code("md", "Q: 2 apples + 3 apples?\nA: Let's think. 2 + 3 = 5. Answer: 5\n\nQ: 4 pears + 1 pear?\nA:"),
          h("Pick patterns on purpose"),
          p("Use few-shot when format matters, step-by-step when logic matters, and neither when the task is trivial — every extra token costs latency and money."),
          warn("Bad examples are worse than none. The model copies your examples' mistakes faithfully."),
        ],
      },
      {
        id: "les_3",
        title: "Building an evaluation set",
        minutes: 26,
        blocks: [
          p("You can't improve what you can't measure. An eval set is a fixed list of inputs with known-good expectations. Run every prompt change against it and you replace opinion with evidence."),
          fig("evalloop", "Prompt → output → score → refine"),
          code("ts", "const cases = [{ input: '...', expect: /refund/i }];\nconst score = cases.filter(c => c.expect.test(run(c.input))).length / cases.length;"),
          win("Thirty real cases is enough to catch most regressions. Perfect is the enemy of shipped."),
        ],
      },
      {
        id: "les_4",
        title: "Automated scoring and LLM judges",
        minutes: 23,
        blocks: [
          p("Exact-match scoring works for structured tasks. For open-ended ones, a second model can judge outputs against a rubric — cheaper and faster than humans, if you keep the rubric tight."),
          h("Keep judges honest"),
          ul([
            "Give the judge a specific rubric, not 'is this good?'.",
            "Score one dimension at a time (accuracy, tone, safety).",
            "Spot-check the judge against human labels periodically.",
          ]),
          info("An LLM judge is a measurement instrument. Calibrate it before you trust its numbers."),
        ],
      },
    ],
  },

  {
    id: "vector-search",
    title: "Vector Search & Embeddings",
    tagline: "The retrieval engine under every AI app.",
    blurb:
      "How embeddings and vector databases actually work — distance metrics, indexes, hybrid search, and the metadata filtering that makes results usable.",
    priceInPaise: 69_900,
    hours: "4h 50m",
    outcomes: [
      "Choose an embedding model and metric",
      "Understand ANN indexes and their trade-offs",
      "Combine vector + keyword + filters",
      "Keep an index fresh and correct",
    ],
    lessons: [
      {
        id: "les_1",
        title: "Embeddings as coordinates for meaning",
        minutes: 24,
        blocks: [
          p("An embedding maps text (or images, or code) to a point in high-dimensional space where distance means dissimilarity. Search becomes geometry: find the points nearest the query."),
          fig("vectors", "Query and its nearest neighbours in embedding space"),
          h("Cosine, dot, or Euclidean?"),
          p("Most text embeddings are compared with cosine similarity — direction, not magnitude, carries the meaning. Match the metric your embedding model was trained with, or your results will quietly degrade."),
          warn("Never mix embeddings from two different models in one index. Their spaces are unrelated; distances become meaningless."),
        ],
      },
      {
        id: "les_2",
        title: "Approximate nearest-neighbour indexes",
        minutes: 28,
        blocks: [
          p("Exact search over millions of vectors is too slow, so vector DBs use ANN indexes (like HNSW) that trade a little accuracy for enormous speed. Understanding the knobs keeps recall high."),
          ul([
            "Higher index quality (more links / probes) = better recall, more memory and latency.",
            "Recall is tunable at query time — raise it for critical searches.",
            "Measure recall against a brute-force baseline before trusting the index.",
          ]),
          fig("funnel", "Millions of vectors narrowed to a handful of candidates"),
          info("Default the index to favour recall. A fast wrong answer is worse than a slightly slower right one."),
        ],
      },
      {
        id: "les_3",
        title: "Hybrid search and filtering",
        minutes: 27,
        blocks: [
          p("Pure vector search misses exact tokens; pure keyword search misses meaning. Hybrid runs both and fuses ranks. Metadata filters then constrain results to what the user is allowed and expects to see."),
          code("ts", "const results = await index.query({\n  vector: embed(q),\n  filter: { tenantId, lang: 'en' },\n  topK: 8,\n});"),
          h("Filter before you rank"),
          p("Apply hard filters (tenant, language, recency) as constraints, not as post-processing — otherwise your top-k fills with results the user can never use."),
          win("Tenant isolation in the filter is a security control, not a nicety. Get it wrong and users see each other's data."),
        ],
      },
      {
        id: "les_4",
        title: "Keeping an index fresh",
        minutes: 25,
        blocks: [
          p("Data changes; stale vectors lie. A production index needs an update path: re-embed changed documents, delete removed ones, and version the embedding model so a swap doesn't corrupt the space."),
          ul([
            "Store a content hash per chunk; re-embed only when it changes.",
            "Soft-delete then purge so in-flight queries stay consistent.",
            "Tag every vector with its embedding-model version.",
          ]),
          info("Plan the re-embedding migration before you pick a model. You will change models eventually."),
        ],
      },
    ],
  },

  {
    id: "fine-tuning",
    title: "Fine-Tuning & Adaptation",
    tagline: "Teach a base model your task and voice.",
    blurb:
      "When to fine-tune versus prompt or retrieve, how LoRA makes it cheap, and how to build the dataset that actually moves the needle.",
    priceInPaise: 99_900,
    hours: "5h 00m",
    outcomes: [
      "Decide fine-tune vs RAG vs prompt",
      "Build and clean a training dataset",
      "Use LoRA / parameter-efficient tuning",
      "Evaluate a tuned model for regressions",
    ],
    lessons: [
      {
        id: "les_1",
        title: "Fine-tune, retrieve, or just prompt?",
        minutes: 24,
        blocks: [
          p("Fine-tuning changes the model's weights; RAG changes its context; prompting changes its instructions. Reaching for the heaviest tool first is the most common — and most expensive — mistake."),
          ul([
            "Need fresh or private facts? Retrieve (RAG).",
            "Need a consistent format, style, or skill? Fine-tune.",
            "Need a one-off behaviour? Prompt.",
          ]),
          warn("Fine-tuning does not teach facts reliably — it teaches behaviour. Use RAG for knowledge, tuning for form."),
        ],
      },
      {
        id: "les_2",
        title: "Datasets are the whole game",
        minutes: 29,
        blocks: [
          p("A tuned model is only as good as its examples. A few hundred clean, consistent, on-task examples beat tens of thousands of noisy ones. The work is curation, not collection."),
          code("jsonl", '{"messages":[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}'),
          h("Quality checklist"),
          ul([
            "Every example demonstrates the exact behaviour you want.",
            "Formats are consistent — the model copies inconsistency.",
            "Hard and edge cases are represented, not just the easy 80%.",
          ]),
          info("Deduplicate and hold out a test split before training. Leakage makes a bad model look great."),
        ],
      },
      {
        id: "les_3",
        title: "LoRA and efficient tuning",
        minutes: 27,
        blocks: [
          p("Full fine-tuning updates every weight — expensive and easy to break. LoRA trains a small set of adapter weights instead, keeping the base frozen. You get most of the benefit for a fraction of the cost."),
          fig("layers", "LoRA adapts thin layers while the base model stays frozen"),
          win("LoRA adapters are small and swappable — you can keep one base model and hot-swap task adapters."),
        ],
      },
      {
        id: "les_4",
        title: "Evaluating a tuned model",
        minutes: 26,
        blocks: [
          p("Tuning improves your target task but can quietly degrade everything else — 'catastrophic forgetting'. Evaluate on both the new task and a general suite before you ship."),
          fig("evalloop", "Tune → evaluate on task + general → decide"),
          warn("A model that aced your task but forgot how to follow basic instructions is a regression, not a win. Always keep a general eval alongside the task eval."),
        ],
      },
    ],
  },

  {
    id: "mlops",
    title: "MLOps & Deployment",
    tagline: "Get models to production and keep them healthy.",
    blurb:
      "Packaging, serving, versioning, and monitoring models in production — plus the drift detection that tells you when reality has moved on.",
    priceInPaise: 89_900,
    hours: "5h 30m",
    outcomes: [
      "Serve a model behind a stable API",
      "Version data, models, and prompts",
      "Monitor latency, cost, and quality",
      "Detect drift and roll back safely",
    ],
    lessons: [
      {
        id: "les_1",
        title: "From notebook to endpoint",
        minutes: 26,
        blocks: [
          p("A model in a notebook helps no one. Production means a versioned artifact behind a stable, monitored API — reproducible, rollback-able, and boring in the best way."),
          fig("pipeline", "Train → package → serve behind a stable API"),
          h("Package everything"),
          p("Pin the model weights, the preprocessing code, and the dependency versions together. 'Works on my machine' is a model-serving outage waiting to happen."),
          info("The interface is the contract. Keep the request/response shape stable even as the model behind it changes."),
        ],
      },
      {
        id: "les_2",
        title: "Versioning models, data, and prompts",
        minutes: 27,
        blocks: [
          p("In ML, behaviour depends on three moving things: the code, the data, and (for LLMs) the prompt. Version all three, or you'll never reproduce a result — or a bug."),
          ul([
            "Tag every deployed model with a version and its training data snapshot.",
            "Treat prompts as versioned artifacts, not string literals.",
            "Log which versions served each request.",
          ]),
          warn("A prompt edit is a deploy. Ship it through the same review and rollback path as code."),
        ],
      },
      {
        id: "les_3",
        title: "Monitoring what matters",
        minutes: 28,
        blocks: [
          p("Uptime isn't quality. A model can be perfectly available and quietly wrong. Monitor the ML signals — latency, cost per request, and output quality — alongside the usual infra metrics."),
          code("ts", "log({ requestId, model: 'v3', tokens, latencyMs, ok });"),
          win("Sample and store real inputs/outputs (with consent). They become tomorrow's eval set and today's debugging trail."),
        ],
      },
      {
        id: "les_4",
        title: "Drift detection and rollback",
        minutes: 25,
        blocks: [
          p("The world changes; training data doesn't. Drift is when live inputs diverge from what the model learned, and accuracy erodes silently. Detect it by watching input distributions and quality metrics over time."),
          fig("evalloop", "Serve → monitor → detect drift → retrain or roll back"),
          warn("Always keep the previous model version one switch away. When quality drops, roll back first and investigate second."),
        ],
      },
    ],
  },

  {
    id: "deep-learning",
    title: "Deep Learning Essentials",
    tagline: "How neural networks actually learn.",
    blurb:
      "Neurons, layers, backpropagation, and the transformer — the intuition behind the architecture that powers modern AI, without drowning in notation.",
    priceInPaise: 79_900,
    hours: "6h 10m",
    outcomes: [
      "Understand neurons, layers, and activations",
      "Follow backpropagation intuitively",
      "Grasp attention and transformers",
      "Know why depth and data scale",
    ],
    lessons: [
      {
        id: "les_1",
        title: "Neurons, layers, and activations",
        minutes: 27,
        blocks: [
          p("A neuron computes a weighted sum of its inputs and passes it through a non-linear activation. Stack neurons into layers, stack layers into a network, and you can approximate remarkably complex functions."),
          fig("network", "Inputs flow through hidden layers to an output"),
          h("Why the non-linearity matters"),
          p("Without activations, stacking layers collapses to a single linear function — no matter how deep. The non-linearity is what lets depth buy expressiveness."),
          info("ReLU is the sensible default activation: simple, fast, and it just works for most networks."),
        ],
      },
      {
        id: "les_2",
        title: "Backpropagation, intuitively",
        minutes: 30,
        blocks: [
          p("Backprop is how a network assigns blame. It measures how much each weight contributed to the error and nudges it to reduce that error — the chain rule, applied layer by layer, from output back to input."),
          code("py", "loss = criterion(model(x), y)\nloss.backward()   # blame flows backward\noptimizer.step()  # every weight nudged"),
          win("You rarely implement backprop yourself — but knowing it's just 'blame, propagated' demystifies why training behaves the way it does."),
        ],
      },
      {
        id: "les_3",
        title: "Attention and transformers",
        minutes: 32,
        blocks: [
          p("Attention lets each token look at every other token and weigh what's relevant. The transformer stacks attention layers, and that ability to relate any position to any other is what made large language models possible."),
          fig("network", "Every token attends to every other — the transformer's core"),
          h("Why it beat recurrence"),
          p("Older models processed sequences step by step, forgetting the distant past. Attention sees the whole sequence at once and parallelises across it — faster to train and better at long-range context."),
          info("You don't need the math to build with transformers — but 'everything attends to everything' explains most of their strengths and costs."),
        ],
      },
      {
        id: "les_4",
        title: "Why scale works",
        minutes: 26,
        blocks: [
          p("Deep learning's surprising lesson: more data, more parameters, and more compute keep improving results in predictable ways. Capability often emerges from scale rather than clever architecture."),
          ul([
            "More parameters = more capacity to fit patterns.",
            "More data = less overfitting, better generalisation.",
            "More compute = the budget to use both.",
          ]),
          warn("Scale is expensive and has limits. For most real problems, better data beats a bigger model."),
        ],
      },
    ],
  },

  {
    id: "ai-products",
    title: "Building AI Products",
    tagline: "Turn a model into something people pay for.",
    blurb:
      "The product craft around AI: scoping to the model's strengths, designing for uncertainty, keeping humans in the loop, and earning trust.",
    priceInPaise: 59_900,
    hours: "4h 40m",
    outcomes: [
      "Scope features to what models do well",
      "Design UX for probabilistic output",
      "Place humans in the loop wisely",
      "Build trust, safety, and feedback in",
    ],
    lessons: [
      {
        id: "les_1",
        title: "Scoping to the model's strengths",
        minutes: 22,
        blocks: [
          p("The best AI features play to what models are good at — summarising, drafting, classifying, extracting — and avoid what they're bad at, like precise arithmetic or being right every single time. Scope decides success before a line of code."),
          ul([
            "Great fits: draft-then-edit, search, triage, extraction.",
            "Risky fits: anything requiring guaranteed correctness with no review.",
          ]),
          info("Pick features where a good-but-imperfect answer is still useful. That's where AI shines and disappoints least."),
        ],
      },
      {
        id: "les_2",
        title: "Designing for uncertainty",
        minutes: 24,
        blocks: [
          p("Traditional software is deterministic; AI isn't. Good AI UX makes the uncertainty visible and recoverable — show confidence, make outputs editable, and always leave an escape hatch."),
          fig("pipeline", "Suggest → let the user review → they decide"),
          h("Suggest, don't dictate"),
          p("Frame AI output as a proposal the user accepts, edits, or rejects. That single stance turns wrong answers from failures into drafts."),
          win("An 'undo' and an 'edit' button do more for AI trust than a few points of accuracy."),
        ],
      },
      {
        id: "les_3",
        title: "Humans in the loop",
        minutes: 23,
        blocks: [
          p("Full autonomy is rarely the right first step. Keeping a human in the loop — approving, correcting, or spot-checking — buys safety and generates the labelled data that makes the next version better."),
          ul([
            "Automate the easy, high-confidence cases.",
            "Route the uncertain ones to a human.",
            "Capture every correction as training signal.",
          ]),
          warn("Automate irreversible actions last, and only after the loop has earned your trust with data."),
        ],
      },
      {
        id: "les_4",
        title: "Trust, safety, and feedback",
        minutes: 25,
        blocks: [
          p("Users forgive a wrong answer they can catch; they don't forgive a confident wrong answer they can't. Trust is built with transparency, guardrails, and a feedback loop that visibly improves the product."),
          fig("evalloop", "Ship → collect feedback → improve → ship"),
          info("A thumbs-up/down that actually changes the product is worth more than a perfect launch. Close the loop."),
        ],
      },
    ],
  },
];

export function getCourse(courseId: string): SeedCourse | undefined {
  return COURSES.find((c) => c.id === courseId);
}
