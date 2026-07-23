# Micro-LMS

A decoupled micro-LMS platform.

- **Frontend:** Next.js (static export) → GitHub Pages
- **API:** Node.js → Railway
- **Database:** MongoDB Atlas
- **Payments:** Razorpay

## Status: Phase 0 — Doc-Driven Development

No application code yet. The engineering standards are authored and locked
**first**, in [`docs/`](docs/). Read them before any implementation:

1. [Architecture Standards](docs/01-architecture-standards.md) — Trinity Architecture + security protocols
2. [Data Serialization](docs/02-data-serialization.md) — the Serialization Adapter pattern
3. [Schema Design](docs/03-schema-design.md) — MongoDB collections
4. [API Contracts](docs/04-api-contracts.md) — REST endpoints, shapes, error envelope

See [`CLAUDE.md`](CLAUDE.md) for the prime directive: **read `docs/` before
writing or modifying any code.**
