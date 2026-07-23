import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { SectionLabel } from "@/components/SectionLabel";
import { CourseCard } from "@/features/course/ui/CourseCard";
import { getAllCourses } from "@/features/course/catalog";

export const metadata: Metadata = {
  title: "Courses",
  description: "Text-first AI courses — RAG, agents, ML, LLM engineering, and more.",
};

export default function CoursesPage() {
  const courses = getAllCourses();
  return (
    <Container className="py-6 sm:py-10">
      <header>
        <SectionLabel index="00" title="Catalog" />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          Learn <GradientText>AI</GradientText>, end to end.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-400">
          {courses.length} focused, text-first courses — every lesson is detailed writing and clear
          diagrams, no video to scrub through. Pick where you want to go deep.
        </p>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </Container>
  );
}
