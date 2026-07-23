/**
 * CourseContent repository (Data layer). The only place `CourseContentModel` is
 * queried. Returns rich domain objects via the adapter (docs/02).
 */
import { CourseContentModel } from "../models/course-content.model.js";
import { courseContentAdapter } from "../adapters/course-content.adapter.js";
import type { LessonContentDomain } from "../domain/types.js";

export const courseContentRepository = {
  async get(courseId: string, lessonId: string): Promise<LessonContentDomain | null> {
    const doc = await CourseContentModel.findOne({ courseId, lessonId });
    return doc ? courseContentAdapter.toDomain(doc) : null;
  },
};
