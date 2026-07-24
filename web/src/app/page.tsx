import { Container, ButtonLink, Badge } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { PulseDot } from "@/components/PulseDot";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { HeroGraphic } from "@/components/HeroGraphic";
import { CourseCard } from "@/features/course/ui/CourseCard";
import { getAllCourses, getStarterCourse } from "@/features/course/catalog";
import { CodeIcon, LayersIcon, RouteIcon, CheckIcon, ArrowRightIcon } from "@/components/Icons";

const HOW = [
  {
    Icon: CodeIcon,
    title: "Read, don't scrub",
    body: "Every lesson is detailed writing you can skim, search, and revisit — no 40-minute video for a three-minute idea.",
  },
  {
    Icon: LayersIcon,
    title: "Diagrams that explain",
    body: "Concepts are drawn as clean, custom SVG diagrams — the mental model, not a talking head.",
  },
  {
    Icon: RouteIcon,
    title: "Progress that follows you",
    body: "Mark lessons complete and resume exactly where you left off, synced across devices through the API.",
  },
];

const FAQ = [
  { q: "Are these video courses?", a: "No — on purpose. Every lesson is detailed writing plus custom diagrams. You read at your own pace, search the text, and never scrub a timeline." },
  { q: "Do I need to be an ML expert?", a: "No. Courses start from intuition and build up. If you can write basic code and are curious about AI, you can follow along." },
  { q: "What topics are covered?", a: "Ten courses across the modern AI stack: RAG, agents, ML foundations, LLM engineering, prompting, vector search, fine-tuning, MLOps, deep learning, and AI products." },
  { q: "Is it really free?", a: "Yes. Every course and every lesson is free right now, with no trial and no card required. An account exists only so your progress saves and resumes across devices." },
];

export default function HomePage() {
  const courses = getAllCourses();
  const starter = getStarterCourse();

  return (
    <Container>
      {/* HERO */}
      <section className="grid grid-cols-1 items-center gap-12 py-8 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone="emerald">
              <PulseDot color="bg-emerald-400" />
              Text-first · no video filler
            </Badge>
            <Badge>{courses.length} courses</Badge>
          </div>

          <h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Learn AI, from <GradientText>RAG to agents</GradientText>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Focused, text-first courses across the modern AI stack — retrieval, agents, fine-tuning,
            deployment, and more. Every lesson is detailed writing and clear diagrams you can read at
            your own pace. No video to scrub through.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonLink href={`/course/${starter.id}`}>
              Start reading free
              <ArrowRightIcon width={16} height={16} />
            </ButtonLink>
            <ButtonLink href="/courses" variant="ghost">
              Browse all {courses.length} courses
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5"><CheckIcon width={14} height={14} className="text-cyan" /> Every course free</span>
            <span className="inline-flex items-center gap-1.5"><CheckIcon width={14} height={14} className="text-cyan" /> Detailed text + diagrams</span>
            <span className="inline-flex items-center gap-1.5"><CheckIcon width={14} height={14} className="text-cyan" /> Lifetime access</span>
          </div>
        </div>

        <Reveal delay={0.15}>
          <HeroGraphic />
        </Reveal>
      </section>

      {/* CATALOG */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel index="01" title="Catalog" />
            <h2 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Pick where you go <GradientText>deep</GradientText>.
            </h2>
          </div>
          <ButtonLink href="/courses" variant="ghost">
            View all {courses.length}
          </ButtonLink>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 6).map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.08}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal>
          <SectionLabel index="02" title="How it works" />
          <h2 className="mt-8 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Built to <GradientText>read</GradientText>, not to watch.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {HOW.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-zinc-800 bg-white/[0.02] p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan/25 bg-cyan/[0.06] text-cyan">
                  <c.Icon width={20} height={20} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-zinc-50">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-900 py-20">
        <Reveal className="mx-auto max-w-3xl">
          <SectionLabel index="03" title="Questions" />
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
              Every course, <GradientText>free</GradientText>.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              No paywall and no trial. Create an account so your progress saves, then read
              anything in the catalog.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href={`/course/${starter.id}`}>
                Start with {starter.title}
                <ArrowRightIcon width={16} height={16} />
              </ButtonLink>
              <ButtonLink href="/courses" variant="ghost">
                Browse all {courses.length} courses
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </Container>
  );
}
