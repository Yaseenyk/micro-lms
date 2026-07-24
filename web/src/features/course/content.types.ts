/**
 * Lesson content types (mirror of the API contract, docs/04 §7b / docs/03 §4).
 * The API returns these already domain-shaped, so the service passes them
 * straight through.
 */
export type ContentBlock =
  // prose
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language?: string; code: string; caption?: string }
  | { type: "callout"; tone: "info" | "warn" | "success"; text: string }
  | { type: "svg"; svg: string; caption?: string }
  // course scaffolding
  | { type: "objectives"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "exercise"; title?: string; text: string; hint?: string }
  | { type: "summary"; items: string[] };

export interface LessonContent {
  courseId: string;
  lessonId: string;
  title: string;
  minutes: number;
  blocks: ContentBlock[];
}
