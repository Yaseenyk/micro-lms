/**
 * CourseProgress repository (Data layer). The only place `CourseProgressModel`
 * is queried. Reads/writes the LEAN shape through the Serialization Adapter
 * (docs/02); services only ever see the rich domain object. Owns ObjectId
 * mapping and timestamps.
 */
import type { UpdateQuery } from "mongoose";
import { CourseProgressModel, type CourseProgressDoc } from "../models/course-progress.model.js";
import {
  courseProgressAdapter,
  encodeLesson,
  type CourseProgressLeanDoc,
} from "../adapters/course-progress.adapter.js";
import type { CourseProgressDomain, LessonProgress } from "../domain/types.js";
import { nowUnix } from "../lib/time.js";

function toLean(doc: CourseProgressDoc): CourseProgressLeanDoc {
  const lean: CourseProgressLeanDoc = {
    u: doc.u.toString(),
    c: doc.c,
    l: doc.l,
    t: doc.t,
    ua: doc.ua,
  };
  if (doc.iv) lean.iv = doc.iv;
  return lean;
}

export const courseProgressRepository = {
  async get(userId: string, courseId: string): Promise<CourseProgressDomain | null> {
    const doc = await CourseProgressModel.findOne({ u: userId, c: courseId });
    return doc ? courseProgressAdapter.toDomain(toLean(doc)) : null;
  },

  /** Partial write: set a single lesson tuple (docs/03 §3 — no full-map rewrite). */
  async upsertLesson(input: {
    userId: string;
    courseId: string;
    totalLessons: number;
    lessonId: string;
    lesson: LessonProgress;
  }): Promise<CourseProgressDomain> {
    const now = nowUnix();
    const update: UpdateQuery<CourseProgressDoc> = {
      $set: {
        [`l.${input.lessonId}`]: encodeLesson(input.lesson),
        t: input.totalLessons,
        ua: now,
        updatedAt: now,
      },
      $setOnInsert: { u: input.userId, c: input.courseId, sv: 1, createdAt: now },
    };
    const doc = await CourseProgressModel.findOneAndUpdate(
      { u: input.userId, c: input.courseId },
      update,
      { new: true, upsert: true },
    );
    return courseProgressAdapter.toDomain(toLean(doc));
  },
};
