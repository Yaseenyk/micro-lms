/**
 * Display-only course catalog (Presentation concern). Mirrors the authored
 * course/lesson metadata seeded on the API (api/src/content/courses.ts). It is
 * NOT the source of truth for price or entitlement — the API resolves price
 * server-side (docs/04 §8) and gates content by entitlement (docs/04 §7b). Lesson
 * *bodies* are fetched per-lesson from the API; this only powers titles, the
 * curriculum list, and marketing copy.
 */
export interface CourseLesson {
  id: string;
  title: string;
  minutes: number;
}
export interface CourseMeta {
  id: string;
  title: string;
  tagline: string;
  blurb: string;
  /** Currently "Free" for every course (docs/04 §0a). */
  priceLabel: string;
  hours: string;
  lessons: CourseLesson[];
  outcomes: string[];
  /** The low-friction entry course the landing page points newcomers at. */
  starter?: boolean;
}

const L = (id: string, title: string, minutes: number): CourseLesson => ({ id, title, minutes });

export const COURSES: CourseMeta[] = [
  {
    id: "rag-systems",
    title: "Retrieval-Augmented Generation",
    tagline: "Give language models a memory they can cite.",
    blurb:
      "Build RAG systems that ground answers in your own data — chunking, embeddings, vector search, and the prompt assembly that stops models from making things up.",
    priceLabel: "Free",
    hours: "5h 10m",
    outcomes: [
      "Chunk and embed a corpus without destroying meaning",
      "Retrieve the right context with hybrid search",
      "Assemble prompts that ground and cite sources",
      "Measure and fix retrieval quality",
    ],
    lessons: [
      // Module 1 (premium deep-dive). Modules 2–4 below still hold the earlier
      // shallow lessons and get rewritten as each module is authored.
      L("les_1", "Document Parsing & Ingestion Pipelines", 52),
      L("les_2", "Hybrid Retrieval & Re-ranking", 48),
      L("les_3", "Query Understanding & Advanced Retrieval", 50),
      L("les_4", "Grounding, Generation & Evaluation", 50),
    ],
  },
  {
    id: "agentic-ai",
    title: "Agentic AI Systems",
    tagline: "Models that plan, use tools, and act.",
    blurb:
      "Move beyond single prompts to agents that reason, call tools, and recover from failure — with the guardrails that keep them safe and affordable.",
    priceLabel: "Free",
    hours: "3h 24m",
    outcomes: [
      "Design the reason → act → observe loop",
      "Expose tools an agent can call reliably",
      "Add memory, guardrails, and cost limits",
      "Debug and evaluate multi-step runs",
    ],
    lessons: [
      // All four modules authored — course complete.
      L("les_1", "Core Agentic Architectures & Reasoning Loops", 50),
      L("les_2", "Tool Use & Function Calling", 48),
      L("les_3", "Memory & State Management", 52),
      L("les_4", "Multi-Agent Systems & Human-in-the-Loop", 54),
    ],
  },
  {
    id: "ml-foundations",
    title: "Machine Learning Foundations",
    tagline: "The core ideas everything else is built on.",
    blurb:
      "The mental models behind every ML system — features, training, generalisation, and evaluation — taught with intuition first and just enough math.",
    priceLabel: "Free",
    hours: "5h 40m",
    outcomes: [
      "Frame a problem as supervised learning",
      "Understand training, loss, and gradient descent",
      "Diagnose overfitting vs underfitting",
      "Evaluate models honestly",
    ],
    lessons: [
      L("les_1", "What learning from data means", 23),
      L("les_2", "Training and gradient descent", 30),
      L("les_3", "Overfitting and generalisation", 28),
      L("les_4", "Evaluating models honestly", 26),
    ],
  },
  {
    id: "llm-engineering",
    title: "LLM Application Engineering",
    tagline: "Ship reliable products on top of language models.",
    blurb:
      "The engineering around the model: structured outputs, streaming, context windows, caching, and the failure handling that turns a demo into a product.",
    priceLabel: "Free",
    hours: "5h 25m",
    outcomes: [
      "Get structured, validated output every time",
      "Manage context windows and token budgets",
      "Stream responses and handle failures",
      "Cache and cut latency + cost",
    ],
    lessons: [
      L("les_1", "Structured output you can trust", 25),
      L("les_2", "Context windows and token budgets", 27),
      L("les_3", "Streaming and graceful failure", 24),
      L("les_4", "Caching and cost control", 26),
    ],
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering & Evaluation",
    tagline: "Make prompts a controlled variable, not a guess.",
    blurb:
      "Treat prompts like code: patterns that work, why they work, and the evaluation loop that turns 'it felt better' into a number you can defend.",
    priceLabel: "Free",
    hours: "3h 30m",
    starter: true,
    outcomes: [
      "Reason about tokens, context windows, and sampling",
      "Build reasoning pipelines and enforce structured output",
      "Defend against prompt injection",
      "Evaluate prompts with golden datasets and LLM judges",
    ],
    lessons: [
      L("les_1", "The Core Mechanics", 48),
      L("les_2", "Advanced Prompt Pipelines & Guardrails", 52),
      L("les_3", "Evaluation & Iteration", 52),
      L("les_4", "Optimization & Deployment", 50),
    ],
  },
  {
    id: "vector-search",
    title: "Vector Search & Embeddings",
    tagline: "The retrieval engine under every AI app.",
    blurb:
      "How embeddings and vector databases actually work — distance metrics, indexes, hybrid search, and the metadata filtering that makes results usable.",
    priceLabel: "Free",
    hours: "3h 36m",
    outcomes: [
      "Choose an embedding model and metric",
      "Understand ANN indexes and their trade-offs",
      "Combine vector + keyword + filters",
      "Keep an index fresh and correct",
    ],
    lessons: [
      // All four modules authored — course complete.
      L("les_1", "Vector Math, Embedding Spaces & High-Dimensional Geometry", 56),
      L("les_2", "Vector Indexing & Algorithms: ANN, IVF, PQ & HNSW", 54),
      L("les_3", "Vector Database Internals, Filtering & Production Sizing", 52),
      L("les_4", "Custom Embeddings, Multimodal Vectors & Evaluation", 54),
    ],
  },
  {
    id: "fine-tuning",
    title: "Fine-Tuning & Adaptation",
    tagline: "Teach a base model your task and voice.",
    blurb:
      "When to fine-tune versus prompt or retrieve, how LoRA makes it cheap, and how to build the dataset that actually moves the needle.",
    priceLabel: "Free",
    hours: "5h 00m",
    outcomes: [
      "Decide fine-tune vs RAG vs prompt",
      "Build and clean a training dataset",
      "Use LoRA / parameter-efficient tuning",
      "Evaluate a tuned model for regressions",
    ],
    lessons: [
      L("les_1", "Fine-tune, retrieve, or just prompt?", 24),
      L("les_2", "Datasets are the whole game", 29),
      L("les_3", "LoRA and efficient tuning", 27),
      L("les_4", "Evaluating a tuned model", 26),
    ],
  },
  {
    id: "mlops",
    title: "MLOps & Deployment",
    tagline: "Get models to production and keep them healthy.",
    blurb:
      "Packaging, serving, versioning, and monitoring models in production — plus the drift detection that tells you when reality has moved on.",
    priceLabel: "Free",
    hours: "5h 30m",
    outcomes: [
      "Serve a model behind a stable API",
      "Version data, models, and prompts",
      "Monitor latency, cost, and quality",
      "Detect drift and roll back safely",
    ],
    lessons: [
      L("les_1", "From notebook to endpoint", 26),
      L("les_2", "Versioning models, data, and prompts", 27),
      L("les_3", "Monitoring what matters", 28),
      L("les_4", "Drift detection and rollback", 25),
    ],
  },
  {
    id: "deep-learning",
    title: "Deep Learning Essentials",
    tagline: "How neural networks actually learn.",
    blurb:
      "Neurons, layers, backpropagation, and the transformer — the intuition behind the architecture that powers modern AI, without drowning in notation.",
    priceLabel: "Free",
    hours: "6h 10m",
    outcomes: [
      "Understand neurons, layers, and activations",
      "Follow backpropagation intuitively",
      "Grasp attention and transformers",
      "Know why depth and data scale",
    ],
    lessons: [
      L("les_1", "Neurons, layers, and activations", 27),
      L("les_2", "Backpropagation, intuitively", 30),
      L("les_3", "Attention and transformers", 32),
      L("les_4", "Why scale works", 26),
    ],
  },
  {
    id: "ai-products",
    title: "Building AI Products",
    tagline: "Turn a model into something people pay for.",
    blurb:
      "The product craft around AI: scoping to the model's strengths, designing for uncertainty, keeping humans in the loop, and earning trust.",
    priceLabel: "Free",
    hours: "4h 40m",
    outcomes: [
      "Scope features to what models do well",
      "Design UX for probabilistic output",
      "Place humans in the loop wisely",
      "Build trust, safety, and feedback in",
    ],
    lessons: [
      L("les_1", "Scoping to the model's strengths", 22),
      L("les_2", "Designing for uncertainty", 24),
      L("les_3", "Humans in the loop", 23),
      L("les_4", "Trust, safety, and feedback", 25),
    ],
  },
];

/**
 * Sequential 10-course roadmap — the intended learning order surfaced across the
 * site (homepage catalog order, "what's next" after finishing a course). The
 * applied/product track comes first (build things people use), then the heavier
 * ML theory and ops track fills the back half. This array is the single source
 * of order; reorder here to reshape the whole roadmap. `authored` markers track
 * content build-out.
 */
export const ROADMAP: readonly string[] = [
  "prompt-engineering", //  1 · starter, authored — the low-friction entry point
  "rag-systems",        //  2 · authored
  "agentic-ai",         //  3 · authored
  "vector-search",      //  4 · authoring in progress
  "ai-products",        //  5 · product craft (UX & streaming) before the ML deep dives
  "llm-engineering",    //  6
  "fine-tuning",        //  7 · heavier ML / ops track fills the back half
  "ml-foundations",     //  8
  "deep-learning",      //  9
  "mlops",              // 10
];

const roadmapRank = (id: string): number => {
  const i = ROADMAP.indexOf(id);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i; // unknown ids sink to the end
};

const BY_ID: Record<string, CourseMeta> = Object.fromEntries(COURSES.map((c) => [c.id, c]));

export function getCourseMeta(courseId: string): CourseMeta {
  return BY_ID[courseId] ?? COURSES[0]!;
}

export function getAllCourses(): CourseMeta[] {
  // Presented in roadmap order everywhere (homepage catalog, /courses grid).
  return [...COURSES].sort((a, b) => roadmapRank(a.id) - roadmapRank(b.id));
}

/** The featured flagship course used by the hero CTA. */
export function getStarterCourse(): CourseMeta {
  return COURSES.find((c) => c.starter) ?? COURSES[0]!;
}

/** A course is paid when its price label is not the free sentinel. */
export function isPaidCourse(course: CourseMeta): boolean {
  return course.priceLabel.trim().toLowerCase() !== "free";
}

// "What's next" follows the sequential roadmap: the course immediately after
// this one. Returns null for the final course (nothing after it).
export function getNextCourse(courseId: string): CourseMeta | null {
  const idx = ROADMAP.indexOf(courseId);
  if (idx < 0 || idx >= ROADMAP.length - 1) return null;
  const nextId = ROADMAP[idx + 1];
  return nextId ? (BY_ID[nextId] ?? null) : null;
}

export function courseIds(): string[] {
  return getAllCourses().map((c) => c.id);
}
