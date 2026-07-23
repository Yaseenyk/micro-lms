/**
 * Lesson content types (mirror of the API contract, docs/04 §7b). The API returns
 * these already domain-shaped, so the service passes them straight through.
 */
export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language?: string; code: string }
  | { type: "callout"; tone: "info" | "warn" | "success"; text: string }
  | { type: "svg"; svg: string; caption?: string };

export interface LessonContent {
  courseId: string;
  lessonId: string;
  title: string;
  minutes: number;
  blocks: ContentBlock[];
}
