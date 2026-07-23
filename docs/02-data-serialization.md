# 02 — Data Serialization (The Serialization Adapter Pattern)

> **Status:** Enforced. No raw application object is ever written to MongoDB,
> and no raw MongoDB document is ever handed to the client. Every DB boundary
> is crossed through an Adapter.

## 1. Why this exists

Application state is **rich**: it carries derived values, UI flags, verbose
keys, transient fields, and nested structures convenient for logic. Database
storage should be the opposite: **lean, flat where possible, minimal, and
stable**. Persisting rich state verbatim bloats documents, inflates bandwidth,
couples the DB schema to today's UI, and makes every read pay for data the
client could derive itself.

The **Serialization Adapter** is the single bridge between these two worlds. It
is Layer 3 of the Trinity Architecture (see
[`01-architecture-standards.md`](01-architecture-standards.md)).

**The principle:** *store what is true, derive what is convenient.*

## 2. The contract

Every persisted domain entity has exactly one adapter exposing two pure,
lossless-by-design functions:

```ts
interface SerializationAdapter<Domain, Doc> {
  /** Rich in-memory domain object  ->  lean DB document (strip, compress, encode). */
  toDocument(domain: Domain): Doc;

  /** Lean DB document  ->  rich domain object (rehydrate, derive, default). */
  toDomain(doc: Doc): Domain;
}
```

Rules:

- **Adapters are pure functions.** No I/O, no DB calls, no `Date.now()`, no
  randomness inside them — deterministic input → output. (Timestamps are passed
  in by the repository, not read inside the adapter.)
- **Repositories are the only callers.** A repository calls `toDocument` before
  a write and `toManyDomain` after a read. Services and controllers work only
  with **domain objects** and never see a raw `Doc`.
- **The client never receives a `Doc`.** API responses are built from domain
  objects, then shaped by a *response* adapter (see doc 04). Internal DB field
  names and `_id`/`__v` never leak to the client.

## 3. What "stripping down" means (the transform rules)

When going `toDocument`, the adapter must:

1. **Drop derivable fields.** Anything the client or a service can recompute is
   not stored. Examples: `progressPercent` (derive from completed vs total),
   `isComplete` (derive), display labels, formatted dates.
2. **Drop transient/UI fields.** Selection state, hover flags, expanded/collapsed
   state, optimistic placeholders — never persisted.
3. **Compact keys and shapes.** Prefer compact, stable field names and
   array/delta encodings over verbose nested objects for high-cardinality data
   (e.g. per-second video analytics). Store deltas, not repeated absolutes.
4. **Normalize types.** Round positions/durations to integers where sub-unit
   precision is noise; store enums as short codes, not long strings, where it
   materially reduces size.
5. **Never lose source-of-truth data.** Stripping is only ever applied to
   **derivable or transient** data. If a value cannot be reconstructed, it is
   source-of-truth and **must** be stored.

Going `toDomain`, the adapter rehydrates: it re-derives the dropped convenience
fields, applies defaults for absent optionals, and returns the full rich object
the Logic layer expects.

## 4. Worked example — CourseProgress

The client tracks rich progress: which lessons are done, the exact resume
position per video, per-session watch analytics, and derived UI values.

**Rich domain object (in memory / on the client):**

```ts
interface CourseProgressDomain {
  userId: string;
  courseId: string;
  lessons: Record<string, {           // keyed by lessonId
    completed: boolean;
    lastPositionSec: number;          // resume point
    watchedSec: number;               // total watched
  }>;
  // derived (NOT stored):
  completedCount: number;
  totalLessons: number;
  progressPercent: number;            // completedCount / totalLessons
  isComplete: boolean;
  lastActiveAt: string;
}
```

**Lean DB document (what actually persists):**

```jsonc
{
  "u": "user_123",                    // userId
  "c": "course_abc",                  // courseId
  "l": {                              // lessons, compact
    "les_1": [1, 512, 540],           // [completed(0/1), lastPositionSec, watchedSec]
    "les_2": [0, 88, 90]
  },
  "t": 12,                            // totalLessons snapshot (source of truth at save time)
  "ua": 1737550000                    // lastActiveAt (unix seconds)
}
```

`progressPercent`, `isComplete`, and `completedCount` are **absent** — they are
recomputed by `toDomain`. Verbose per-lesson objects become fixed 3-tuples.
This is the same discipline that cut IntegrateX payloads ~94%: persist the
model, not the view.

```ts
export const courseProgressAdapter: SerializationAdapter<
  CourseProgressDomain,
  CourseProgressDoc
> = {
  toDocument(d) {
    const l: CourseProgressDoc["l"] = {};
    for (const [lessonId, p] of Object.entries(d.lessons)) {
      l[lessonId] = [p.completed ? 1 : 0, Math.round(p.lastPositionSec), Math.round(p.watchedSec)];
    }
    return { u: d.userId, c: d.courseId, l, t: d.totalLessons, ua: toUnix(d.lastActiveAt) };
  },

  toDomain(doc) {
    const lessons: CourseProgressDomain["lessons"] = {};
    let completedCount = 0;
    for (const [lessonId, [done, pos, watched]] of Object.entries(doc.l)) {
      const completed = done === 1;
      if (completed) completedCount++;
      lessons[lessonId] = { completed, lastPositionSec: pos, watchedSec: watched };
    }
    const totalLessons = doc.t;
    return {
      userId: doc.u,
      courseId: doc.c,
      lessons,
      completedCount,
      totalLessons,
      progressPercent: totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0,
      isComplete: totalLessons > 0 && completedCount === totalLessons,
      lastActiveAt: fromUnix(doc.ua),
    };
  },
};
```

## 5. Video analytics — delta encoding

Per-second or per-event video analytics are high-cardinality and the biggest
bloat risk. Rules:

- Store **deltas / run-length or interval encodings**, never a per-second array
  of absolute values.
- Aggregate on write where possible (e.g. watched **intervals** `[[start,end], …]`
  merged), rather than raw event streams.
- Cap and roll up: raw event granularity is reduced to intervals before
  persistence; the adapter owns that reduction.

## 6. Frontend adapters (symmetry)

The frontend has its own thin adapter layer for the **wire ⇄ client-state**
boundary: it maps an API response DTO into the client's rich store shape and
back into a request DTO. It never persists to the DB (that is the API's job),
but it obeys the same rule — the Zustand store holds rich state; the request
payload sent over the wire is lean.

## 7. Enforcement checklist

- [ ] Every persisted entity has exactly one adapter with `toDocument` / `toDomain`.
- [ ] Adapters are pure (no I/O, no clock, no randomness inside).
- [ ] Only repositories call adapters; services/controllers see domain objects only.
- [ ] Derivable and transient fields are stripped on write and re-derived on read.
- [ ] No source-of-truth data is ever dropped.
- [ ] High-cardinality data (analytics) is delta/interval-encoded, not raw.
- [ ] `_id`, `__v`, and internal short keys never leak to the client.
