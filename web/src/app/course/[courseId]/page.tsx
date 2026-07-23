import { Container } from "@/components/ui";
import { CoursePlayer } from "@/features/course/ui/CoursePlayer";

/**
 * Static export needs the set of course ids known at build time (docs/01 §2.1 —
 * the frontend is fully static). The catalog currently ships one course; add
 * ids here as the catalog grows.
 */
export function generateStaticParams(): Array<{ courseId: string }> {
  return [{ courseId: "course_abc" }];
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  return (
    <Container className="py-6 sm:py-10">
      <CoursePlayer courseId={params.courseId} />
    </Container>
  );
}
