/** Rich domain objects used by the Logic layer. These never carry DB-internal
 *  keys; the Data layer's adapters translate to/from lean documents (docs/02). */

export type Role = "student" | "admin";

export interface UserDomain {
  id: string;
  email: string;
  name: string;
  role: Role;
  entitlements: string[];
}

/** What the API is allowed to return about a user (docs/03 §1 — no hashes). */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LessonProgress {
  completed: boolean;
  lastPositionSec: number;
  watchedSec: number;
}

export interface CourseProgressDomain {
  userId: string;
  courseId: string;
  lessons: Record<string, LessonProgress>;
  // derived (never stored — re-computed by the adapter on read):
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
  isComplete: boolean;
  lastActiveAt: string;
}

/** Lesson content blocks (docs/03 §4). Textual + SVG only — no video. */
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
  | { type: "summary"; items: string[] }
  // long-form authored content, rendered as GFM on the client
  | { type: "markdown"; markdown: string };

export interface LessonContentDomain {
  courseId: string;
  lessonId: string;
  title: string;
  minutes: number;
  blocks: ContentBlock[];
}
