import { Container } from "@/components/ui";
import { CoursePlayer } from "@/features/course/ui/CoursePlayer";
import { courseIds } from "@/features/course/catalog";

/**
 * Static export needs the set of course ids known at build time (docs/01 §2.1 —
 * the frontend is fully static). Generated from the catalog, so every course
 * gets a prerendered page.
 */
export function generateStaticParams(): Array<{ courseId: string }> {
  return courseIds().map((courseId) => ({ courseId }));
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  return (
    <Container className="py-6 sm:py-10">
      <CoursePlayer courseId={params.courseId} />
    </Container>
  );
}
