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
const code = (language: string, src: string): B => ({ type: "code", language, code: src });
const info = (text: string): B => ({ type: "callout", tone: "info", text });
const warn = (text: string): B => ({ type: "callout", tone: "warn", text });
const win = (text: string): B => ({ type: "callout", tone: "success", text });
const fig = (name: keyof typeof SVGS, caption: string): B => ({ type: "svg", svg: svg(name), caption });

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
          p("A language model only knows what it was trained on and what you put in the prompt. RAG is the discipline of putting the *right* few paragraphs in the prompt at query time — retrieved from your data — so the model answers from facts instead of memory."),
          h("The core loop"),
          p("Every RAG system is the same four steps: embed the question, search a vector store for the closest chunks, stuff those chunks into the prompt, and let the model answer. The art is in each step, not the shape."),
          fig("retrieval", "The retrieval loop: query → vector store → top-k → LLM"),
          info("Rule of thumb: if the answer exists in three sentences somewhere in your corpus, RAG should find and quote those three sentences — not summarise the whole document."),
        ],
      },
      {
        id: "les_2",
        title: "Chunking without destroying meaning",
        minutes: 26,
        blocks: [
          p("Retrieval works on chunks, so how you split documents decides your ceiling. Split too big and you drown the answer in noise; split too small and you sever the context a sentence needs to make sense."),
          h("Practical defaults"),
          ul([
            "Prefer semantic boundaries (headings, paragraphs) over a fixed character count.",
            "Overlap chunks by ~10–15% so a fact split across a boundary survives.",
            "Attach metadata (source, section, updatedAt) to every chunk — you'll filter on it later.",
          ]),
          code("ts", "function chunk(doc, size = 800, overlap = 120) {\n  const out = [];\n  for (let i = 0; i < doc.length; i += size - overlap)\n    out.push(doc.slice(i, i + size));\n  return out;\n}"),
          warn("Never chunk across unrelated documents. A chunk should always belong to exactly one source so citations stay honest."),
        ],
      },
      {
        id: "les_3",
        title: "Embeddings and vector search",
        minutes: 31,
        blocks: [
          p("An embedding turns text into a vector so that similar meanings land near each other. Retrieval is then just nearest-neighbour search in that space."),
          fig("vectors", "Similar meanings cluster; retrieval finds the nearest neighbours to the query"),
          h("Dense isn't always enough"),
          p("Dense (embedding) search understands meaning but misses exact terms like error codes or product SKUs. Keyword (BM25) search nails exact terms but misses paraphrase. Hybrid search runs both and fuses the ranks — it is the reliable default."),
          info("Start dense-only to ship, then add keyword + reciprocal-rank fusion the first time a user complains that an exact term wasn't found."),
        ],
      },
      {
        id: "les_4",
        title: "Grounding, citations, and evals",
        minutes: 28,
        blocks: [
          p("Retrieval that finds the right chunk is worthless if the prompt lets the model ignore it. Grounding is a prompt contract: answer only from the provided context, and cite the chunk you used."),
          code("ts", "const prompt = `Answer using ONLY the context below.\nIf the context is insufficient, say so.\nCite sources as [n].\n\nContext:\n${chunks.map((c,i)=>`[${i+1}] ${c.text}`).join('\\n')}\n\nQuestion: ${q}`;"),
          h("Measure what matters"),
          p("Track two numbers: retrieval hit-rate (did the right chunk make the top-k?) and faithfulness (did the answer stay inside the context?). A drop in the first is a search problem; a drop in the second is a prompt problem."),
          win("Ship an eval set of 30 real questions before you tune anything. Without it, every 'improvement' is a guess."),
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
