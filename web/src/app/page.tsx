import { Container, Card, ButtonLink, Badge } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { PulseDot } from "@/components/PulseDot";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { HeroGraphic } from "@/components/HeroGraphic";
import {
  KeyIcon,
  CardIcon,
  ShieldIcon,
  DatabaseIcon,
  RouteIcon,
  CodeIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@/components/Icons";
import { getCourseMeta } from "@/features/course/catalog";

const BUILD = [
  { Icon: KeyIcon, title: "Auth that survives a refresh", body: "Stateless JWTs with rotating, httpOnly refresh tokens — a session that persists without ever exposing a credential to JavaScript." },
  { Icon: RouteIcon, title: "A real course player", body: "Access gating, resume-where-you-left-off, and progress that syncs across devices — the exact player you're about to use." },
  { Icon: CardIcon, title: "Payments you can trust", body: "Server-priced Razorpay orders and a signature-verified webhook as the single source of truth for who owns what." },
  { Icon: DatabaseIcon, title: "Lean, versioned data", body: "Serialization adapters that turn rich state into compact payloads — the difference between a DB you can grow and one you fight." },
  { Icon: ShieldIcon, title: "Hardened by default", body: "Pinned JWT algorithms, boot-time env validation, restricted CORS, rate limits, and no secrets in logs — security as a habit, not a patch." },
  { Icon: CodeIcon, title: "The Trinity Architecture", body: "Presentation, Logic, Data — three layers, one boundary rule. Code that stays traceable as it scales instead of turning to mud." },
];

const AUDIENCE = [
  "You can build features, but your apps turn into spaghetti as they grow.",
  "You've never wired real payments and webhooks end to end — and it scares you.",
  "You want architecture you can defend in an interview, not just copy from a tutorial.",
];

const FAQ = [
  { q: "Do I need to be a senior developer?", a: "No. You need to be comfortable writing JavaScript and building basic React. The course takes you from there to production-shaped architecture." },
  { q: "Is this just another to-do app tutorial?", a: "The opposite. The final project is the platform you're reading this on — real auth, real payments, real webhooks. Nothing is faked or hand-waved." },
  { q: "What stack does it use?", a: "TypeScript throughout: Next.js (static export) on the frontend, Node.js + Express + MongoDB on the API, and Razorpay for payments." },
  { q: "Do I get lifetime access?", a: "Yes. One payment, lifetime access, and any future lessons added to this course are included." },
];

export default function HomePage() {
  const course = getCourseMeta("course_abc");

  return (
    <Container>
      {/* HERO */}
      <section className="grid grid-cols-1 items-center gap-12 py-8 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone="emerald">
              <PulseDot color="bg-emerald-400" />
              You&apos;re using the final project right now
            </Badge>
          </div>

          <h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Learn full-stack by building <GradientText>this exact platform</GradientText>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Most courses hand you a to-do app and call it &ldquo;full-stack.&rdquo; This one hands
            you the real thing: authentication, a course player, and live payments — the very app
            you&apos;re reading this on — built layer by layer until you can architect it yourself.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonLink href="/course/course_abc">
              See what&apos;s inside
              <ArrowRightIcon width={16} height={16} />
            </ButtonLink>
            <ButtonLink href="/register" variant="ghost">
              Create free account
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5"><CheckIcon width={14} height={14} className="text-cyan" /> {course.lessons.length} lessons · {course.hours}</span>
            <span className="inline-flex items-center gap-1.5"><CheckIcon width={14} height={14} className="text-cyan" /> Lifetime access</span>
            <span className="inline-flex items-center gap-1.5"><CheckIcon width={14} height={14} className="text-cyan" /> Build a shippable app</span>
          </div>
        </div>

        <Reveal delay={0.15}>
          <HeroGraphic />
        </Reveal>
      </section>

      {/* THE PROMISE */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <SectionLabel index="01" title="The promise" />
          <h2 className="mt-8 text-3xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-4xl">
            Stop collecting tutorials.
            <br />
            Start shipping <GradientText>architecture</GradientText>.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            You already know how to make things work. What separates you from a senior role is making
            them work <span className="text-zinc-200">at scale</span> — code that stays clean, data
            that stays lean, and money that never gets lost. That&apos;s the whole course.
          </p>
        </Reveal>
      </section>

      {/* WHAT YOU'LL BUILD */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal>
          <SectionLabel index="02" title="What you'll build" />
          <h2 className="mt-8 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Six things most developers never wire up <GradientText>correctly</GradientText>.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUILD.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 0.08}>
              <Card className="h-full">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan/25 bg-cyan/[0.06] text-cyan">
                  <b.Icon width={20} height={20} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-zinc-50">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{b.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="border-t border-zinc-900 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <SectionLabel index="03" title="Curriculum" />
            <h2 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              {course.lessons.length} lessons, in the order you&apos;d actually build it.
            </h2>
            <p className="mt-4 text-zinc-400">
              No filler. Each lesson adds one real capability to the app — from an empty repo to a
              deployed, paid product.
            </p>
            <ButtonLink href="/course/course_abc" className="mt-8">
              Preview the course
              <ArrowRightIcon width={16} height={16} />
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="divide-y divide-zinc-900 overflow-hidden rounded-2xl border border-zinc-800 bg-white/[0.02]">
              {course.lessons.map((l, i) => (
                <li key={l.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-zinc-800 text-xs tabular-nums text-zinc-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-zinc-200">{l.title}</span>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-600">{l.minutes}m</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="border-t border-zinc-900 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionLabel index="04" title="Who it's for" />
            <h2 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              This is for you if…
            </h2>
            <ul className="mt-6 space-y-4">
              {AUDIENCE.map((a) => (
                <li key={a} className="flex items-start gap-3 text-zinc-300">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan/15 text-cyan">
                    <CheckIcon width={12} height={12} />
                  </span>
                  <span className="leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Credibility — honest: the platform is the proof */}
          <Reveal delay={0.1}>
            <Card className="h-full">
              <SectionLabel index="05" title="Who's behind it" />
              <p className="mt-6 leading-relaxed text-zinc-300">
                Built by the engineer who architected this platform — the same person you can watch
                ship it, lesson by lesson. No borrowed slides, no theory you can&apos;t run.
              </p>
              <p className="mt-4 leading-relaxed text-zinc-400">
                The proof isn&apos;t a testimonial. It&apos;s the app in your browser: real auth,
                real payments, real webhooks, running in production shape.
              </p>
              <a
                href="https://yaseenkhatib.streamerosai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ice underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-cyan"
              >
                See the engineer&apos;s work
                <ArrowRightIcon width={15} height={15} />
              </a>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal className="mx-auto max-w-3xl">
          <SectionLabel index="06" title="Questions" />
          <h2 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Before you ask.
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-zinc-800 bg-white/[0.02] px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-zinc-100">
                  {f.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-zinc-800 text-zinc-400 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-white/[0.02] px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-cyan/10 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              The best way to understand this app is to <GradientText>build it</GradientText>.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Create a free account, look inside the course, and start with lesson one. Unlock the
              full build for {course.priceLabel} whenever you&apos;re ready.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/register">
                Start free
                <ArrowRightIcon width={16} height={16} />
              </ButtonLink>
              <ButtonLink href="/course/course_abc" variant="ghost">
                View the course
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </Container>
  );
}
