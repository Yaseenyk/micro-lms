import { Container } from "@/components/ui";

export default function HomePage() {
  return (
    <Container>
      <section className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan">Trinity Architecture</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-100">
          Learn to ship full-stack, <span className="text-cyan">the right way</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
          A decoupled micro-LMS: a static Next.js frontend, a hardened Node.js API, and a
          signature-verified payment flow. Every layer separated, every payload lean.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <a
            href="/course/course_abc/"
            className="inline-flex items-center justify-center rounded-xl bg-cyan px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110"
          >
            View the course
          </a>
          <a
            href="/register/"
            className="inline-flex items-center justify-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            Create account
          </a>
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Presentation", d: "Thin React + route handlers. Render or receive — nothing else." },
          { t: "Logic", d: "Hooks, stores, services. The runtime source of truth." },
          { t: "Data", d: "One HTTP client + Serialization Adapters. Lean payloads only." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-line bg-panel/60 p-5">
            <h3 className="text-sm font-bold text-slate-100">{c.t}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{c.d}</p>
          </div>
        ))}
      </section>
    </Container>
  );
}
