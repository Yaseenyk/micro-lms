# 04 — API Contracts

> **Status:** Enforced and versioned. These request/response shapes and the
> error envelope are the contract between the static frontend and the Node.js
> API. **Changing a contract means changing this document first**, then the
> code. The frontend codes against these shapes, never against raw DB documents.

## 0a. Free-access mode (current default)

The platform currently runs **free**: `FREE_ACCESS` (env, defaults to `true`)
makes every catalog course available to any authenticated user. While it is on:

- `POST /api/course/access` always returns `access: true` for a catalog course.
- `POST /api/course/lesson` and `PATCH /api/course/progress` require only a
  valid session, not an entitlement.
- `POST /api/payment/order` and `POST /api/webhooks/razorpay` are **not mounted**,
  and no Razorpay credentials are required to boot.

Setting `FREE_ACCESS=false` restores the paid flow exactly as specified in §8–9;
the Razorpay keys then become required at boot (docs/01 §2.1 fail-fast). The
entitlement model in `users.entitlements` is untouched either way — free mode
bypasses the check, it does not delete the data.

---

## 0. Conventions

- **Base URL:** the Railway API origin (from `NEXT_PUBLIC_API_URL` on the
  client). All routes are prefixed `/api`.
- **Format:** JSON in, JSON out (`Content-Type: application/json`), **except**
  the Razorpay webhook, which is read as a **raw body** for signature
  verification.
- **Auth:** protected routes require `Authorization: Bearer <accessToken>`.
  Refresh happens via an httpOnly cookie, not a header.
- **Validation:** every request body/params/query is parsed with a Zod schema at
  the boundary. Invalid input → `422 VALIDATION_ERROR` (see envelope).
- **Success envelope:** `{ "ok": true, "data": <payload> }`.
- **Money:** integer paise + explicit currency, matching doc 03.
- **No leaked internals:** responses are built from domain objects via a
  response adapter; `_id`/`__v`/hashes/short DB keys never appear.

---

## 1. The error envelope (standard for every failure)

Every non-2xx response has this exact shape:

```jsonc
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",     // stable machine-readable code (SCREAMING_SNAKE)
    "message": "email is required", // human-readable, safe to surface
    "details": [                    // optional; field-level issues
      { "path": "email", "issue": "required" }
    ],
    "requestId": "req_a1b2c3"        // correlation id, also in logs
  }
}
```

**Canonical codes → HTTP status**

| Code | HTTP | Meaning |
| --- | --- | --- |
| `VALIDATION_ERROR` | 422 | Body/params failed schema validation. |
| `UNAUTHENTICATED` | 401 | Missing/absent credentials. |
| `INVALID_TOKEN` | 401 | JWT invalid/expired. |
| `FORBIDDEN` | 403 | Authenticated but not allowed (role/ownership). |
| `NOT_FOUND` | 404 | Resource does not exist (or not visible to caller). |
| `CONFLICT` | 409 | Uniqueness/idempotency conflict. |
| `RATE_LIMITED` | 429 | Too many requests. |
| `PAYMENT_ERROR` | 402 | Payment could not be created/verified. |
| `INTERNAL` | 500 | Unexpected. Message is generic; details are logged, not returned. |

Rules: never leak stack traces, secrets, or DB errors to the client. `INTERNAL`
always returns a generic message; the real cause is logged with `requestId`.

---

## 2. `POST /api/auth/register`

Create a student account.

**Request**

```jsonc
{ "email": "a@b.com", "password": "min-8-chars", "name": "Asha" }
```

**Response `201`**

```jsonc
{ "ok": true, "data": {
  "user": { "id": "user_123", "email": "a@b.com", "name": "Asha", "role": "student" },
  "accessToken": "<jwt>"          // access token in body; refresh set as httpOnly cookie
}}
```

Errors: `422 VALIDATION_ERROR`, `409 CONFLICT` (email exists).

## 3. `POST /api/auth/login`

**Request** `{ "email": "a@b.com", "password": "…" }`

**Response `200`** — same `data` shape as register. Sets rotated refresh cookie.

Errors: `422`, `401 UNAUTHENTICATED` (bad credentials — **generic** message, no
"user not found" vs "wrong password" distinction).

## 4. `POST /api/auth/refresh`

Uses the httpOnly refresh cookie (no body). Rotates the refresh token.

**Response `200`** `{ "ok": true, "data": { "accessToken": "<jwt>" } }`

Errors: `401 INVALID_TOKEN` (missing/expired/rotated-away cookie).

## 5. `POST /api/auth/logout`

Revokes the refresh token (clears `refreshTokenHash`) and clears the cookie.
**Response `200`** `{ "ok": true, "data": { "loggedOut": true } }`.

---

## 6. `POST /api/course/access` *(protected)*

Answers "may the current user access this course, and where do they resume?"
This is the gate the player calls before loading content.

**Request** `{ "courseId": "course_abc" }`

**Response `200` — has access**

```jsonc
{ "ok": true, "data": {
  "courseId": "course_abc",
  "access": true,
  "progress": {                    // built via the CourseProgress adapter (doc 02)
    "progressPercent": 42,
    "isComplete": false,
    "lastActiveAt": "2026-07-22T10:00:00Z",
    "lessons": {
      "les_1": { "completed": true,  "lastPositionSec": 512 },
      "les_2": { "completed": false, "lastPositionSec": 88 }
    }
  }
}}
```

**Response `200` — no access** (not an error; a state)

```jsonc
{ "ok": true, "data": { "courseId": "course_abc", "access": false, "progress": null } }
```

Access is decided in the **Logic layer** by checking `users.entitlements`.
Errors: `401`, `422`.

## 7. `PATCH /api/course/progress` *(protected)*

Persist a progress update. Body is the **lean** update (the client adapter has
already stripped derived/transient fields); the API re-adapts to the DB tuple.

**Request**

```jsonc
{
  "courseId": "course_abc",
  "lessonId": "les_2",
  "completed": true,
  "lastPositionSec": 540,
  "watchedSec": 540
}
```

**Response `200`** returns the re-derived rich progress (same `progress` shape
as §6). Ownership is enforced (a user may only write their own progress →
`403 FORBIDDEN` otherwise). Errors: `401`, `403`, `422`, `404` (no entitlement).

## 7b. `POST /api/course/lesson` *(protected)*

Fetch the **textual + SVG** content of a single lesson (docs/03 §4). Gated by
entitlement: a user who does not own the course gets `404 NOT_FOUND` (same as
progress writes — access is not leaked).

**Request** `{ "courseId": "course_abc", "lessonId": "les_1" }`

**Response `200`**

```jsonc
{ "ok": true, "data": {
  "courseId": "course_abc",
  "lessonId": "les_1",
  "title": "How a decoupled app fits together",
  "minutes": 24,
  "blocks": [
    { "type": "heading",   "text": "The two-halves model" },
    { "type": "paragraph", "text": "A decoupled app is really two programs…" },
    { "type": "code",      "language": "ts", "code": "export const api = …" },
    { "type": "callout",   "tone": "info", "text": "Rule of thumb: …" },
    { "type": "svg",       "svg": "<svg …>…</svg>", "caption": "Request lifecycle" }
  ]
}}
```

Errors: `401`, `422`, `404 NOT_FOUND` (no entitlement, or lesson has no content).

---

## 8. `POST /api/payment/order` *(protected)*

Create a Razorpay order for a course. Amount is resolved **server-side** from
the catalog — never trusted from the client.

**Request** `{ "courseId": "course_abc" }`

**Response `201`**

```jsonc
{ "ok": true, "data": {
  "orderId": "order_XYZ",          // Razorpay order id
  "amount": 49900,                 // paise, server-resolved
  "currency": "INR",
  "razorpayKeyId": "rzp_live_xxx"  // publishable key only
}}
```

A `transactions` doc is created with `status: "created"`. Errors: `401`, `422`,
`402 PAYMENT_ERROR`, `409 CONFLICT` (already owned).

## 9. `POST /api/webhooks/razorpay` *(public, signature-verified)*

The **source of truth** for payment state and entitlement. See
[`01-architecture-standards.md`](01-architecture-standards.md) §2.3.

- Mounted with a **raw-body** parser. The handler verifies
  `X-Razorpay-Signature` (HMAC-SHA256, timing-safe) **before** parsing/trusting
  the body. Invalid/missing signature → `400`, logged, no state change.
- **Idempotent:** the event id is checked against `transactions.webhookEventIds`;
  a duplicate is a no-op.
- On `payment.captured`: the matching `transactions` doc flips to `"paid"`, the
  event id is recorded, and the `courseId` is added to `users.entitlements` —
  **atomically**.
- On `payment.failed`: `status: "failed"`; no entitlement granted.

**Response `200`** `{ "ok": true, "data": { "received": true } }` — always
`200` once the signature is valid (so Razorpay stops retrying), even for
already-processed events. `400` only for signature failure.

> The client's Razorpay Checkout success handler **must not** be trusted to
> grant access. It only triggers a UI transition; entitlement is granted here.

---

## 10. Endpoint summary

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create account. |
| POST | `/api/auth/login` | — | Log in. |
| POST | `/api/auth/refresh` | cookie | Rotate access token. |
| POST | `/api/auth/logout` | cookie | Revoke session. |
| POST | `/api/course/access` | Bearer | Check access + resume state. |
| PATCH | `/api/course/progress` | Bearer | Persist progress (lean update). |
| POST | `/api/course/lesson` | Bearer | Fetch a lesson's textual + SVG content (entitlement-gated). |
| POST | `/api/payment/order` | Bearer | Create Razorpay order (server-priced). |
| POST | `/api/webhooks/razorpay` | signature | Verified payment + entitlement source of truth. |

## 11. Enforcement checklist

- [ ] Every response uses the success or error envelope exactly.
- [ ] Every failure uses a canonical `code` with the mapped HTTP status.
- [ ] No raw DB document, `_id`, `__v`, hash, or short key is ever returned.
- [ ] Course price is resolved server-side; client-sent amounts are ignored.
- [ ] Entitlement is granted only by the verified webhook, never a client callback.
- [ ] Ownership/role checks live in the Logic layer, not the handler.
- [ ] The webhook verifies the raw-body signature before trusting anything.
