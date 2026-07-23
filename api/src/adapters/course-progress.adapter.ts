/**
 * CourseProgress Serialization Adapter (docs/02 §4). Rich domain ⇄ lean
 * document. Pure: no I/O, no clock, no ObjectId generation. The lean doc uses
 * `u` as the string userId (docs/02 §4); the repository maps it to/from a
 * Mongoose ObjectId and owns `_id`, `createdAt`, `updatedAt`.
 */
import type { SerializationAdapter } from "./serialization-adapter.js";
import type { CourseProgressDomain, LessonProgress } from "../domain/types.js";
import type { LessonTuple } from "../models/course-progress.model.js";
import { fromUnix, toUnix } from "../lib/time.js";

/** The lean, persistable shape the adapter owns (excludes _id/timestamps). */
export interface CourseProgressLeanDoc {
  u: string;
  c: string;
  l: Record<string, LessonTuple>;
  t: number;
  iv?: Record<string, [number, number][]>;
  ua: number;
}

export function encodeLesson(p: LessonProgress): LessonTuple {
  return [p.completed ? 1 : 0, Math.round(p.lastPositionSec), Math.round(p.watchedSec)];
}

export const courseProgressAdapter: SerializationAdapter<
  CourseProgressDomain,
  CourseProgressLeanDoc
> = {
  toDocument(d) {
    const l: Record<string, LessonTuple> = {};
    for (const [lessonId, p] of Object.entries(d.lessons)) {
      l[lessonId] = encodeLesson(p);
    }
    return { u: d.userId, c: d.courseId, l, t: d.totalLessons, ua: toUnix(d.lastActiveAt) };
  },

  toDomain(doc) {
    const lessons: Record<string, LessonProgress> = {};
    let completedCount = 0;
    for (const [lessonId, tuple] of Object.entries(doc.l)) {
      const completed = tuple[0] === 1;
      if (completed) completedCount++;
      lessons[lessonId] = { completed, lastPositionSec: tuple[1], watchedSec: tuple[2] };
    }
    const totalLessons = doc.t;
    return {
      userId: doc.u,
      courseId: doc.c,
      lessons,
      completedCount,
      totalLessons,
      progressPercent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
      isComplete: totalLessons > 0 && completedCount === totalLessons,
      lastActiveAt: fromUnix(doc.ua),
    };
  },
};
