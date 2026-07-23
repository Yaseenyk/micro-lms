# web — Micro-LMS frontend

Static Next.js 14 app (App Router, `output: "export"`). Ships as pure static
files; holds only `NEXT_PUBLIC_*` **publishable** values — never a secret.

> **Read [`../docs`](../docs) before writing or modifying any code.** Every file
> must sit in its correct Trinity layer (docs/01 §1.3).

## Trinity layout

```
src/
  components/            # Presentation — dumb, prop-driven UI (ui.tsx, SiteNav)
  app/                   # Presentation — routes (/, /login, /register, /course/[id])
  features/<f>/
    ui/                  # Presentation for the feature
    hooks/               # Logic — useAuth, useCourse, useCheckout
    services/            # Data — API calls, run through adapters
  lib/
    api-client.ts        # Data — the ONLY place fetch lives; speaks the envelope
    adapters/            # Serialization Adapters (wire ⇄ domain)
    config.ts            # publishable env, read once
  stores/                # Logic — Zustand (auth.store: in-memory access token)
```

Data flow: UI → hook (Logic) → service (Data) → `api-client` → API. Every hop
crosses exactly one boundary; nothing skips a layer.

## Run

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL + NEXT_PUBLIC_RAZORPAY_KEY_ID
npm install
npm run dev                  # :3000  (API expected at NEXT_PUBLIC_API_URL)
npm run build                # static export → ./out
```

## Notes

- The access token lives **in memory only**; a hard refresh silently re-mints it
  from the httpOnly refresh cookie via `/auth/refresh` (handled in `api-client`).
- Razorpay Checkout's success callback is a **UI signal only** — entitlement is
  granted by the verified webhook (docs/04 §9). The player re-polls `/course/access`.
- Course prices are never sent by the client; the API resolves them server-side.
