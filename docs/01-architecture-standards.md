# 01 — Architecture Standards

> **Status:** Enforced. Every module, on frontend and backend, must conform.
> Reviews reject code that violates the layer boundaries or the security
> protocols below.

This document defines the two pillars every contributor (human or AI) must
uphold: the **Trinity Architecture** (how code is separated) and the
**Security Protocols** (what is never compromised).

---

## 1. The Trinity Architecture

The Trinity Architecture is a strict **three-layer separation of concerns**.
Its purpose is predictability: state stays traceable, UI stays disposable, and
business/data logic stays isolated and testable. It is applied on **both** the
Next.js frontend and the Node.js API.

### 1.1 The three layers

| Layer | Frontend (Next.js) | Backend (Node.js) | Responsibility |
| --- | --- | --- | --- |
| **1. Presentation** | React components, pages | Route handlers / controllers | Render or receive. Declarative, thin. Zero business or persistence logic. |
| **2. Logic / Orchestration** | Hooks, client state (Zustand), state machines | Services / use-cases | The source of truth for runtime behaviour: validation, business rules, orchestration between modules. |
| **3. Data / Serialization** | API client services + Serialization Adapters | Repositories + Serialization Adapters + Mongoose models | The only layer that talks to the network or the database. Transforms rich state ⇄ lean payloads. |

### 1.2 The Boundary Rule (non-negotiable)

**No layer may talk past its adjacent neighbour.**

- Presentation **never** imports a repository, a Mongoose model, or `fetch`
  directly. It calls a hook (frontend) or a service (backend).
- The Logic layer **never** builds a database query or formats a DB document.
  It calls the Data layer through a typed interface.
- The Data layer **never** mutates UI state or contains business rules. It
  moves data across the wire/DB and adapts its shape (see
  [`02-data-serialization.md`](02-data-serialization.md)).

> A component that formats a MongoDB document, or a controller that contains an
> `if (user.plan === "pro")` business decision, is a boundary violation and is
> rejected in review.

### 1.3 Directory structure

**Frontend (`/web`)**

```
web/src/
  components/      # Presentation — dumb, prop-driven React
  features/
    <feature>/
      ui/          # Presentation for the feature
      hooks/       # Logic — useCourseProgress(), useCheckout()
      services/    # Data — API client calls + adapters
  lib/
    api-client.ts  # single typed HTTP client (the ONLY place fetch lives)
    adapters/      # Serialization Adapters (client side)
  stores/          # Logic — Zustand stores (runtime source of truth)
```

**Backend (`/api`)**

```
api/src/
  routes/          # Presentation — thin handlers, parse + delegate + respond
  services/        # Logic — business rules, orchestration, authorization
  repositories/    # Data — the ONLY place Mongoose models are queried
  adapters/        # Serialization Adapters (domain <-> DB document)
  models/          # Mongoose schemas
  middleware/      # auth (JWT), validation, error envelope, rate limiting
  config/          # env validation, constants
  lib/             # jwt, razorpay, logger
```

### 1.4 Data flow (canonical request)

```
Client UI (Presentation)
   → hook (Logic)
      → api-client service (Data)  ──HTTP──▶  route handler (Presentation)
                                                 → service (Logic)
                                                    → repository (Data)
                                                       → adapter.toDocument()
                                                          → MongoDB
```

Every hop crosses exactly one boundary. Nothing skips a layer.

---

## 2. Security Protocols

Security rules are **hard requirements**. Code that violates any of them does
not merge, regardless of feature pressure.

### 2.1 Environment variable validation (fail fast at boot)

- **All** configuration comes from environment variables. There are **no
  hard-coded secrets, URLs, keys, or connection strings** anywhere in the
  codebase — not in source, not in tests, not in comments.
- Environment variables are validated **once, at process start**, with a schema
  (Zod). If a required variable is missing or malformed, the process **refuses
  to start** with a clear error. No lazy `process.env.X` reads scattered through
  the code.

```ts
// api/src/config/env.ts — the single source of validated config
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().default(8080),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().url(),
});

export const env = EnvSchema.parse(process.env); // throws → process exits
```

- Secrets live in Railway's secret store (API) and are **never** committed. A
  `.env.example` documents the *names* only, never values. `.env` is
  git-ignored.
- The frontend is static; it may only ever hold **publishable** values
  (`NEXT_PUBLIC_*`, e.g. the Razorpay `key_id`). Secret keys never reach the
  client bundle.

### 2.2 JWT validation (every protected request)

- Auth is stateless JWT. Access tokens are **short-lived** (≤15 min); refresh
  tokens are long-lived, rotated, and stored as **httpOnly, Secure, SameSite**
  cookies — never in `localStorage`.
- A single `requireAuth` middleware validates **signature, expiry, issuer, and
  audience** on every protected route, then attaches a typed `req.auth`
  (`{ userId, role }`). Handlers never parse tokens themselves.
- Tokens are signed with `JWT_SECRET` (≥32 chars). Algorithm is pinned
  (`HS256`); `alg: none` and algorithm confusion are rejected.
- Authorization (role/ownership checks) happens in the **Logic layer**, not in
  the handler — e.g. "does this user own this CourseProgress?" is a service
  decision.

```ts
// api/src/middleware/require-auth.ts
export function requireAuth(req, res, next) {
  const token = extractBearer(req); // Authorization: Bearer <access>
  if (!token) return next(new AppError("UNAUTHENTICATED", 401));
  try {
    const claims = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "micro-lms",
      audience: "micro-lms-web",
    });
    req.auth = { userId: claims.sub, role: claims.role };
    next();
  } catch {
    next(new AppError("INVALID_TOKEN", 401));
  }
}
```

### 2.3 Razorpay webhook signature verification (trust nothing unverified)

- The webhook route reads the **raw request body** (not the JSON-parsed body)
  and verifies the `X-Razorpay-Signature` header via HMAC-SHA256 with
  `RAZORPAY_WEBHOOK_SECRET` **before** any handler logic runs. An invalid or
  missing signature is rejected with `400` and logged; the body is never
  trusted.
- Verification uses a **timing-safe** comparison.
- Webhook processing is **idempotent**: every event's `razorpay_payment_id`
  (or event id) is recorded, and a re-delivered event is a no-op. Payment state
  is driven by the **verified webhook**, never by the client's checkout success
  callback (the client callback only triggers a UI transition).

```ts
// api/src/routes/webhooks.razorpay.ts  (mounted with a raw-body parser)
import crypto from "node:crypto";

function verifyRazorpaySignature(rawBody: Buffer, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature ?? "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

### 2.4 Baseline hardening (always on)

- **CORS** is restricted to the known frontend origin (`CORS_ORIGIN`), not `*`.
- **Input validation** at the boundary: every request body/params/query is
  parsed with a Zod schema in the handler; unvalidated input never reaches a
  service.
- **Rate limiting** on auth and payment routes.
- **No secrets in logs.** Tokens, keys, and full payment payloads are never
  logged. Errors are logged with correlation ids, not sensitive bodies.
- **Least privilege** on the MongoDB Atlas user; TLS enforced on the connection.

---

## 3. Enforcement checklist (review gate)

A change is rejected if any of these is false:

- [ ] Every file lives in its correct Trinity layer; no boundary is crossed.
- [ ] No component/handler contains business logic or DB formatting.
- [ ] No raw application object is written to MongoDB (adapters used — see doc 02).
- [ ] No hard-coded secret, URL, or key anywhere.
- [ ] Env is validated at boot via the Zod schema.
- [ ] Every protected route passes through `requireAuth`.
- [ ] The Razorpay webhook verifies the signature on the raw body before use.
- [ ] Request input is validated with Zod at the boundary.
