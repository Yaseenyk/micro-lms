import { Container, Card, ButtonLink, Badge } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { PulseDot } from "@/components/PulseDot";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { getCourseMeta } from "@/features/course/catalog";

const TRINITY = [
  {
    layer: "Presentation",
    body: "Thin React + route handlers. They render or receive — never a business rule, never a DB shape.",
  },
  {
    layer: "Logic",
    body: "Hooks, Zustand stores, services. The runtime source of truth: validation, orchestration, authorization.",
  },
  {
    layer: "Data",
    body: "One typed HTTP client + Serialization Adapters. The only layer on the wire, moving lean payloads.",
  },
];

export default function HomePage() {
  const course = getCourseMeta("course_abc");

  return (
    <Container>
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone="emerald">
              <PulseDot color="bg-emerald-400" />
              Live demo · full stack running
            </Badge>
            <Badge>Trinity Architecture</Badge>
          </div>

          <h1 className="mt-8 text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Learn to ship full-stack,
            <br />
            <GradientText className="whitespace-nowrap">the right way.</GradientText>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-400">
            A decoupled micro-LMS: a static Next.js frontend, a hardened Node.js API, and a
            signature-verified payment flow. Every layer separated, every payload lean — and the
            course inside teaches you exactly how it&apos;s built.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/register">Create your account</ButtonLink>
            <ButtonLink href="/course/course_abc" variant="ghost">
              Preview the course
            </ButtonLink>
          </div>
        </div>

        {/* Course teaser card */}
        <Reveal className="w-full" delay={0.15}>
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan/10 blur-3xl" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Featured course</span>
              <span className="rounded-full border border-cyan/30 bg-cyan/[0.06] px-3 py-1 text-xs font-semibold text-ice">
                {course.priceLabel}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-zinc-50">{course.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{course.tagline}</p>
            <div className="mt-4 flex gap-4 text-xs text-zinc-500">
              <span>{course.lessons.length} lessons</span>
              <span>·</span>
              <span>{course.hours}</span>
              <span>·</span>
              <span>Lifetime access</span>
            </div>
            <ul className="mt-5 space-y-2">
              {course.lessons.slice(0, 4).map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 text-sm text-zinc-300">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-zinc-800 text-xs text-zinc-500">
                    {i + 1}
                  </span>
                  {l.title}
                </li>
              ))}
              <li className="pl-9 text-xs text-zinc-600">+ {course.lessons.length - 4} more lessons</li>
            </ul>
            <ButtonLink href="/course/course_abc" className="mt-6 w-full">
              View course
            </ButtonLink>
          </Card>
        </Reveal>
      </section>

      {/* Trinity */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal>
          <SectionLabel index="01" title="The Architecture" />
          <h2 className="mt-8 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Three layers. One <GradientText>boundary rule</GradientText>.
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            No layer talks past its neighbour. State stays traceable, UI stays disposable, and
            business logic stays isolated. It&apos;s the spine of this app — and the syllabus.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {TRINITY.map((t, i) => (
            <Reveal key={t.layer} delay={i * 0.1}>
              <Card className="h-full">
                <span className="tabular-nums text-sm text-cyan">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-zinc-50">{t.layer}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal className="rounded-3xl border border-zinc-800 bg-white/[0.02] px-6 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Ready to build it for <GradientText>real</GradientText>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Create an account, unlock the course, and follow the exact architecture this platform
            runs on.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/register">Get started</ButtonLink>
            <ButtonLink href="/login" variant="ghost">
              I already have an account
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </Container>
  );
}
