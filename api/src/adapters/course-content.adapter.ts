/**
 * CourseContent Serialization Adapter (docs/01 §1.3, docs/02). Maps the stored
 * document to the rich domain object — dropping `_id`/`sv`/timestamps and
 * validating each block against the ContentBlock union so a malformed stored
 * block can never reach the client.
 */
import type { CourseContentDoc } from "../models/course-content.model.js";
import type { ContentBlock, LessonContentDomain } from "../domain/types.js";

const TONES = new Set(["info", "warn", "success"]);

function toBlock(raw: unknown): ContentBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  switch (b.type) {
    case "heading":
      return typeof b.text === "string" ? { type: "heading", text: b.text } : null;
    case "paragraph":
      return typeof b.text === "string" ? { type: "paragraph", text: b.text } : null;
    case "list":
      return Array.isArray(b.items) && b.items.every((i) => typeof i === "string")
        ? { type: "list", items: b.items as string[] }
        : null;
    case "code":
      return typeof b.code === "string"
        ? {
            type: "code",
            code: b.code,
            ...(typeof b.language === "string" ? { language: b.language } : {}),
          }
        : null;
    case "callout":
      return typeof b.text === "string" && typeof b.tone === "string" && TONES.has(b.tone)
        ? { type: "callout", tone: b.tone as "info" | "warn" | "success", text: b.text }
        : null;
    case "svg":
      return typeof b.svg === "string"
        ? { type: "svg", svg: b.svg, ...(typeof b.caption === "string" ? { caption: b.caption } : {}) }
        : null;
    default:
      return null;
  }
}

export const courseContentAdapter = {
  toDomain(doc: CourseContentDoc): LessonContentDomain {
    return {
      courseId: doc.courseId,
      lessonId: doc.lessonId,
      title: doc.title,
      minutes: doc.minutes,
      blocks: doc.blocks.map(toBlock).filter((b): b is ContentBlock => b !== null),
    };
  },
};
