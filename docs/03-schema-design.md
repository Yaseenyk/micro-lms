# 03 — Schema Design (MongoDB)

> **Status:** Enforced. These are the canonical collections. Fields are named
> and shaped to be cheap to store and to serialize through the adapters in
> [`02-data-serialization.md`](02-data-serialization.md). Changing a schema
> means updating this doc **and** its adapter in the same change.

## 0. Conventions

- **Storage keys are lean.** Documents use compact, stable field names; rich
  domain names live in the adapter, not the DB.
- **Money is integer minor units.** All amounts are stored as **paise** (₹1 =
  100), never floats. Currency is stored explicitly (`INR`).
- **Timestamps are Unix seconds** (`number`) in documents; ISO strings exist
  only in the domain layer.
- **Every collection has** `createdAt` / `updatedAt` (unix seconds) and a
  schema version tag `sv` for safe migrations.
- **No secret or PII beyond what is required.** Passwords are Argon2/bcrypt
  hashes, never plaintext. No card data is ever stored (Razorpay holds it).

---

## 1. `users`

Identity, auth, and entitlement.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key. |
| `email` | string | **Unique**, canonicalized for dedup: lowercased + trimmed; for `gmail.com`/`googlemail.com` the dots and `+tag` in the local part are stripped and the domain folded to `gmail.com` (see `lib/email.ts`). Stored + matched in canonical form so aliases map to one account. |
| `pwdHash` | string | Argon2id/bcrypt hash. Never returned to any layer above Data. |
| `name` | string | Display name. |
| `role` | string enum | `"student"` \| `"admin"`. Drives authorization. |
| `entitlements` | string[] | Course ids the user has paid access to (see §2 flow). |
| `refreshTokenHash` | string \| null | Hash of the current refresh token (rotation/revocation). Never the raw token. |
| `sv` | number | Schema version. |
| `createdAt` / `updatedAt` | number | Unix seconds. |

**Indexes**

- `{ email: 1 }` unique.
- `{ entitlements: 1 }` (access checks).

**Rules**

- `pwdHash` and `refreshTokenHash` are **stripped by the response adapter** and
  never appear in any API payload.
- Entitlement is the source of truth for course access and is written **only**
  by the verified payment webhook path (doc 04, §`/api/webhooks/razorpay`).

---

## 2. `transactions`

One document per payment attempt/order. This is the audit trail and the
idempotency anchor for Razorpay.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key. |
| `userId` | ObjectId | Ref `users`. |
| `courseId` | string | Course being purchased. |
| `orderId` | string | Razorpay `order_id`. **Unique.** |
| `paymentId` | string \| null | Razorpay `payment_id`, set on capture. **Unique (sparse).** |
| `amount` | number | Paise. Source of truth for what was charged. |
| `currency` | string | `"INR"`. |
| `status` | string enum | `"created"` \| `"paid"` \| `"failed"` \| `"refunded"`. |
| `webhookEventIds` | string[] | Processed Razorpay event ids — **idempotency ledger**. |
| `sv` | number | Schema version. |
| `createdAt` / `updatedAt` | number | Unix seconds. |

**Indexes**

- `{ orderId: 1 }` unique.
- `{ paymentId: 1 }` unique sparse.
- `{ userId: 1, courseId: 1 }` (has this user bought this course?).

**Rules**

- `status` transitions are driven by the **verified webhook**, never the client
  callback. A client "success" only updates UI.
- Before processing a webhook event, its id is checked against
  `webhookEventIds`; if present, the event is a **no-op** (idempotent).
- On a `paid` transition, and only then, the `courseId` is added to the user's
  `entitlements` in the same atomic operation.

---

## 3. `courseProgress`

One document per `(user, course)`. Optimized hard for the Serialization Adapter
— this is the hot, frequently-written collection.

**Stored (lean) shape** — see the adapter in doc 02:

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key. |
| `u` | ObjectId | userId. |
| `c` | string | courseId. |
| `l` | object | Map `lessonId -> [completed(0\|1), lastPositionSec(int), watchedSec(int)]`. Compact 3-tuples. |
| `t` | number | Snapshot of total lessons at write time (source of truth for %). |
| `iv` | object? | Optional per-lesson watched **intervals** `lessonId -> [[startSec,endSec], …]` for analytics, interval-encoded. |
| `ua` | number | lastActiveAt, unix seconds. |
| `sv` | number | Schema version. |
| `createdAt` / `updatedAt` | number | Unix seconds. |

**Indexes**

- `{ u: 1, c: 1 }` unique (one progress doc per user per course).

**Rules**

- **Never store derived fields** (`progressPercent`, `isComplete`,
  `completedCount`) — the adapter re-derives them on read.
- Lesson state is a fixed tuple, not a verbose object, to keep the hot document
  small under frequent writes.
- Analytics (`iv`) are **interval-encoded**, never a per-second array.
- Writes are partial where possible (update a single lesson tuple) rather than
  rewriting the whole `l` map.

---

## 4. Relationships (at a glance)

```
users (1) ──< transactions (N)          // a user has many payment attempts
users (1) ──< courseProgress (N)         // a user has progress per course
users.entitlements ⊇ { courseId }        // granted only via a paid transaction
```

Course/lesson **content** (titles, video ids, lesson lists) is treated as
relatively static catalog data and is out of scope for these three write-hot
collections; it is referenced by id only.

## 5. Enforcement checklist

- [ ] Amounts are integer paise, never floats.
- [ ] Timestamps are unix seconds in documents.
- [ ] `pwdHash` / `refreshTokenHash` never leave the Data layer.
- [ ] `courseProgress` stores no derived fields; lessons are compact tuples.
- [ ] Unique indexes exist on `email`, `orderId`, `paymentId`, and `(u,c)`.
- [ ] Entitlements are written only by the verified webhook path.
- [ ] Every collection carries `sv`, `createdAt`, `updatedAt`.
