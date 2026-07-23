# CLAUDE.md — Micro-LMS Engineering Constitution

Decoupled micro-LMS platform.

- **Frontend:** Next.js (App Router, `output: "export"` — static) on GitHub Pages.
- **API:** Node.js (Express/Fastify) on Railway.
- **Database:** MongoDB Atlas.
- **Payments:** Razorpay (Checkout + Webhooks).

## THE PRIME DIRECTIVE — read this before touching code

**You MUST read the `docs/` folder before writing or modifying ANY code.**
The documents there are not suggestions; they are the enforced engineering
contract for this repository. In order:

1. [`docs/01-architecture-standards.md`](docs/01-architecture-standards.md) — the Trinity Architecture and security protocols.
2. [`docs/02-data-serialization.md`](docs/02-data-serialization.md) — the Serialization Adapter pattern.
3. [`docs/03-schema-design.md`](docs/03-schema-design.md) — the MongoDB schemas.
4. [`docs/04-api-contracts.md`](docs/04-api-contracts.md) — the REST API contracts.

If a task conflicts with a rule in `docs/`, or a rule is ambiguous, **stop and
ask for clarification.** Do not improvise around the standards.

## Non-negotiables (the short version — the docs are the full law)

- **Trinity Architecture.** Every feature is split into three layers —
  Presentation, Logic/Orchestration, Data/Serialization — on both frontend and
  backend. No layer may reach past its neighbour. UI never talks to the DB or
  formats a schema; the data layer never mutates UI state.
- **Serialization Adapters at every DB boundary.** Rich in-memory state is
  transformed into lean, optimized payloads before it is persisted, and
  rehydrated on read. No raw application objects are ever written to MongoDB.
- **Security is not optional.** JWTs are validated on every protected request;
  environment variables are validated at boot; no secret is ever hard-coded;
  every Razorpay webhook signature is verified before its body is trusted.
- **The API contract is law.** Request/response shapes and the error envelope
  in `docs/04-api-contracts.md` are fixed. Changing a contract means changing
  the doc first.

## Phase

Currently **Phase 0: Doc-Driven Development.** No application code is written
yet. The `docs/` set is authored and reviewed first; implementation (Phase 1)
begins only once the standards are locked.
